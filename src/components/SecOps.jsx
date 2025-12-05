import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Shield, AlertTriangle, Lock, Bug, Search, FileCode, FolderTree, 
  ChevronRight, ChevronDown, Folder, FolderOpen, File, Loader2, 
  RefreshCw, AlertCircle, Eye, X, ExternalLink
} from 'lucide-react';

// ============================================
// SAST Security Patterns (The Real Work)
// ============================================
const SECURITY_RULES = [
  // === Secret Scanner ===
  { 
    id: 'SECRET_OPENAI_KEY',
    pattern: /sk-[a-zA-Z0-9]{20,}/g, 
    type: 'Hardcoded API Key', 
    severity: 'high',
    category: 'secrets',
    message: 'OpenAI API key detected! This should be stored in environment variables (.env)',
    recommendation: 'Move to .env file and use process.env.OPENAI_API_KEY'
  },
  { 
    id: 'SECRET_GITHUB_TOKEN',
    pattern: /ghp_[a-zA-Z0-9]{36}/g, 
    type: 'GitHub Token Exposed', 
    severity: 'high',
    category: 'secrets',
    message: 'GitHub Personal Access Token detected! Never commit tokens to source code.',
    recommendation: 'Use GitHub Secrets or environment variables'
  },
  { 
    id: 'SECRET_GENERIC_KEY',
    pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*["']([^"']{8,})["']/gi, 
    type: 'API Key Assignment', 
    severity: 'high',
    category: 'secrets',
    message: 'Potential API key hardcoded in source code.',
    recommendation: 'Store sensitive keys in environment variables or secret managers'
  },
  { 
    id: 'SECRET_PASSWORD',
    pattern: /(?:password|passwd|pwd)\s*[:=]\s*["']([^"']+)["']/gi, 
    type: 'Hardcoded Password', 
    severity: 'high',
    category: 'secrets',
    message: 'Password found in source code! This is a critical security risk.',
    recommendation: 'Never hardcode passwords. Use environment variables or vault services.'
  },
  { 
    id: 'SECRET_PRIVATE_KEY',
    pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g, 
    type: 'Private Key Exposed', 
    severity: 'high',
    category: 'secrets',
    message: 'Private key found in code! This could lead to complete system compromise.',
    recommendation: 'Store private keys securely, never in source code.'
  },
  { 
    id: 'SECRET_AWS',
    pattern: /(?:AKIA|A3T|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g, 
    type: 'AWS Access Key', 
    severity: 'high',
    category: 'secrets',
    message: 'AWS Access Key ID detected! AWS credentials must never be in code.',
    recommendation: 'Use AWS IAM roles or environment variables'
  },
  { 
    id: 'SECRET_GENERIC',
    pattern: /(?:secret|token|auth)\s*[:=]\s*["']([^"']{8,})["']/gi, 
    type: 'Secret/Token Exposure', 
    severity: 'medium',
    category: 'secrets',
    message: 'Potential secret or token found in code.',
    recommendation: 'Review if this is sensitive data and move to secure storage'
  },

  // === PII Leakage ===
  { 
    id: 'PII_EMAIL',
    pattern: /["'][a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}["']/g, 
    type: 'Email Address (PII)', 
    severity: 'medium',
    category: 'pii',
    message: 'Hardcoded email address found. Could be PII or test data exposure.',
    recommendation: 'Remove hardcoded emails or use anonymized test data'
  },
  { 
    id: 'PII_PHONE',
    pattern: /["']\+?[\d\s\-()]{10,}["']/g, 
    type: 'Phone Number (PII)', 
    severity: 'medium',
    category: 'pii',
    message: 'Potential phone number detected. PII should not be hardcoded.',
    recommendation: 'Use anonymized test data or remove personal information'
  },
  { 
    id: 'PII_SSN',
    pattern: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, 
    type: 'SSN Pattern (PII)', 
    severity: 'high',
    category: 'pii',
    message: 'Potential Social Security Number pattern detected!',
    recommendation: 'Remove immediately. SSN exposure is a serious compliance violation.'
  },

  // === Insecure Patterns ===
  { 
    id: 'INSECURE_DEBUG',
    pattern: /debug\s*[:=]\s*(?:true|True|1|["']true["'])/gi, 
    type: 'Debug Mode Enabled', 
    severity: 'medium',
    category: 'insecure',
    message: 'Debug mode is enabled. This can expose sensitive information in production.',
    recommendation: 'Ensure debug is disabled in production environments'
  },
  { 
    id: 'INSECURE_HOST',
    pattern: /["']0\.0\.0\.0["']/g, 
    type: 'Exposed Host Binding', 
    severity: 'medium',
    category: 'insecure',
    message: 'Binding to 0.0.0.0 exposes the service to all network interfaces.',
    recommendation: 'Use specific IP bindings in production or localhost for development'
  },
  { 
    id: 'INSECURE_EVAL',
    pattern: /\beval\s*\(/g, 
    type: 'Dangerous eval() Usage', 
    severity: 'high',
    category: 'insecure',
    message: 'eval() can execute arbitrary code. This is a code injection risk.',
    recommendation: 'Avoid eval(). Use safer alternatives like JSON.parse()'
  },
  { 
    id: 'INSECURE_EXEC',
    pattern: /(?:exec|system|shell_exec|passthru)\s*\(/g, 
    type: 'Command Execution', 
    severity: 'high',
    category: 'insecure',
    message: 'Direct command execution detected. This can lead to command injection.',
    recommendation: 'Validate and sanitize all inputs. Consider using safer alternatives.'
  },
  { 
    id: 'INSECURE_SQL',
    pattern: /(?:execute|query)\s*\(\s*["'`].*\+|f["'].*\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE)/gi, 
    type: 'SQL Injection Risk', 
    severity: 'high',
    category: 'insecure',
    message: 'Potential SQL injection vulnerability. String concatenation in queries is dangerous.',
    recommendation: 'Use parameterized queries or ORM methods'
  },
  { 
    id: 'INSECURE_HTTP',
    pattern: /["']http:\/\/(?!localhost|127\.0\.0\.1)/g, 
    type: 'Insecure HTTP', 
    severity: 'low',
    category: 'insecure',
    message: 'Using HTTP instead of HTTPS. Data may be transmitted unencrypted.',
    recommendation: 'Use HTTPS for all external communications'
  },
  { 
    id: 'INSECURE_CORS',
    pattern: /(?:Access-Control-Allow-Origin|cors)\s*[:=]\s*["']\*["']/gi, 
    type: 'Wildcard CORS', 
    severity: 'medium',
    category: 'insecure',
    message: 'CORS is set to allow all origins. This can be a security risk.',
    recommendation: 'Specify allowed origins explicitly'
  },

  // === Code Quality / Review Flags ===
  { 
    id: 'REVIEW_TODO',
    pattern: /\/\/\s*(?:TODO|FIXME|HACK|XXX|BUG):/gi, 
    type: 'Code Review Flag', 
    severity: 'low',
    category: 'review',
    message: 'Code review marker found. These should be addressed before production.',
    recommendation: 'Review and resolve before deployment'
  },
  { 
    id: 'REVIEW_CONSOLE',
    pattern: /console\.(log|debug|info|warn|error)\s*\(/g, 
    type: 'Console Statement', 
    severity: 'low',
    category: 'review',
    message: 'Console logging found. Remove before production deployment.',
    recommendation: 'Use proper logging framework or remove debug statements'
  }
];

// ============================================
// File Icon Component
// ============================================
const getFileIcon = (filename, hasRisk = false) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const iconProps = { size: 16, style: { flexShrink: 0 } };
  
  const iconMap = {
    py: { color: '#3776ab' },
    js: { color: '#f7df1e' },
    jsx: { color: '#61dafb' },
    ts: { color: '#3178c6' },
    tsx: { color: '#3178c6' },
    json: { color: '#cbcb41' },
    md: { color: '#083fa1' },
    html: { color: '#e34c26' },
    css: { color: '#1572b6' },
    env: { color: '#ecd53f' },
    yml: { color: '#cb171e' },
    yaml: { color: '#cb171e' },
    default: { color: '#8b92a8' }
  };

  const config = iconMap[ext] || iconMap.default;
  
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <FileCode {...iconProps} color={config.color} />
      {hasRisk && (
        <div style={{
          position: 'absolute',
          top: -4,
          right: -4,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#ef4444',
          border: '1px solid rgba(10, 15, 30, 0.9)'
        }} />
      )}
    </div>
  );
};

// ============================================
// File Tree Item Component
// ============================================
const TreeItem = ({ item, level = 0, onFileClick, selectedPath, expandedFolders, toggleFolder, fileRisks }) => {
  const isFolder = item.type === 'tree';
  const isExpanded = expandedFolders.has(item.path);
  const isSelected = selectedPath === item.path;
  const hasRisk = fileRisks.has(item.path);
  
  // Check if folder contains any files with risks
  const folderHasRisk = isFolder && Array.from(fileRisks).some(path => path.startsWith(item.path + '/'));
  
  const handleClick = () => {
    if (isFolder) {
      toggleFolder(item.path);
    } else {
      onFileClick(item);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        style={{
          width: '100%',
          padding: '6px 8px',
          paddingLeft: `${12 + level * 16}px`,
          background: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
          border: 'none',
          borderLeft: isSelected ? '2px solid #a855f7' : '2px solid transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          color: isSelected ? '#e0e0e0' : '#a0a8c0',
          fontSize: '13px',
          textAlign: 'left',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'rgba(100, 150, 255, 0.08)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        {/* Expand Icon for Folders */}
        {isFolder ? (
          <span style={{ width: '16px', display: 'flex', justifyContent: 'center' }}>
            {isExpanded ? (
              <ChevronDown size={14} color="#8b92a8" />
            ) : (
              <ChevronRight size={14} color="#8b92a8" />
            )}
          </span>
        ) : (
          <span style={{ width: '16px' }} />
        )}
        
        {/* Icon */}
        {isFolder ? (
          isExpanded ? (
            <FolderOpen size={16} color={folderHasRisk ? '#f59e0b' : '#f59e0b'} />
          ) : (
            <Folder size={16} color={folderHasRisk ? '#f59e0b' : '#f59e0b'} />
          )
        ) : (
          getFileIcon(item.name, hasRisk)
        )}
        
        {/* Name */}
        <span style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          flex: 1
        }}>
          {item.name}
        </span>
        
        {/* Risk indicator for folders */}
        {folderHasRisk && !hasRisk && (
          <span style={{ 
            fontSize: '10px', 
            color: '#f59e0b'
          }}>
            ⚠
          </span>
        )}
      </button>
      
      {/* Children */}
      {isFolder && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeItem
              key={child.path}
              item={child}
              level={level + 1}
              onFileClick={onFileClick}
              selectedPath={selectedPath}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              fileRisks={fileRisks}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// Annotated Code Viewer Component
// ============================================
const AnnotatedCodeViewer = ({ content, issues, fileName }) => {
  const [hoveredIssue, setHoveredIssue] = useState(null);
  
  const lines = content.split('\n');
  const issuesByLine = useMemo(() => {
    const map = new Map();
    issues.forEach(issue => {
      if (!map.has(issue.line)) {
        map.set(issue.line, []);
      }
      map.get(issue.line).push(issue);
    });
    return map;
  }, [issues]);

  const getSeverityColor = (severity) => ({
    high: { bg: 'rgba(239, 68, 68, 0.25)', border: '#ef4444' },
    medium: { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b' },
    low: { bg: 'rgba(100, 150, 255, 0.15)', border: '#6496ff' }
  }[severity] || { bg: 'transparent', border: 'transparent' });

  return (
    <div style={{ 
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      fontSize: '12px',
      lineHeight: '1.6',
      overflow: 'auto',
      height: '100%'
    }}>
      {lines.map((line, index) => {
        const lineNum = index + 1;
        const lineIssues = issuesByLine.get(lineNum) || [];
        const hasIssue = lineIssues.length > 0;
        const highestSeverity = lineIssues.reduce((acc, issue) => {
          const order = { high: 3, medium: 2, low: 1 };
          return order[issue.severity] > order[acc] ? issue.severity : acc;
        }, 'low');
        const colors = getSeverityColor(highestSeverity);

        return (
          <div 
            key={lineNum}
            style={{ 
              display: 'flex',
              background: hasIssue ? colors.bg : 'transparent',
              borderLeft: hasIssue ? `3px solid ${colors.border}` : '3px solid transparent',
              position: 'relative'
            }}
            onMouseEnter={() => hasIssue && setHoveredIssue({ line: lineNum, issues: lineIssues })}
            onMouseLeave={() => setHoveredIssue(null)}
          >
            {/* Line Number */}
            <span style={{
              width: '50px',
              padding: '0 12px',
              color: hasIssue ? colors.border : '#4a5568',
              textAlign: 'right',
              userSelect: 'none',
              flexShrink: 0,
              borderRight: '1px solid rgba(100, 150, 255, 0.1)'
            }}>
              {lineNum}
            </span>
            
            {/* Code Content */}
            <code style={{
              flex: 1,
              padding: '0 16px',
              whiteSpace: 'pre',
              color: '#c0c8dc'
            }}>
              {line || ' '}
            </code>
            
            {/* Issue Indicator */}
            {hasIssue && (
              <span style={{
                padding: '0 8px',
                color: colors.border,
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <AlertTriangle size={12} />
                {lineIssues.length}
              </span>
            )}
            
            {/* Hover Tooltip */}
            {hoveredIssue?.line === lineNum && (
              <div style={{
                position: 'absolute',
                left: '60px',
                top: '100%',
                zIndex: 100,
                background: 'rgba(15, 20, 35, 0.98)',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '12px',
                minWidth: '350px',
                maxWidth: '500px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
              }}>
                {lineIssues.map((issue, i) => (
                  <div key={i} style={{ marginBottom: i < lineIssues.length - 1 ? '12px' : 0 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '6px'
                    }}>
                      <span style={{
                        padding: '2px 6px',
                        background: getSeverityColor(issue.severity).bg,
                        border: `1px solid ${getSeverityColor(issue.severity).border}`,
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: getSeverityColor(issue.severity).border,
                        textTransform: 'uppercase',
                        fontWeight: '600'
                      }}>
                        {issue.severity}
                      </span>
                      <span style={{ color: '#e0e0e0', fontSize: '12px', fontWeight: '500' }}>
                        {issue.type}
                      </span>
                    </div>
                    <p style={{ color: '#a0a8c0', fontSize: '11px', marginBottom: '6px' }}>
                      {issue.message}
                    </p>
                    <p style={{ color: '#10b981', fontSize: '11px' }}>
                      💡 {issue.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// Main SecOps Component
// ============================================
const SecOps = ({ projectData }) => {
  const [fileTree, setFileTree] = useState([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [error, setError] = useState(null);
  const [allFileIssues, setAllFileIssues] = useState(new Map()); // path -> issues[]
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, scanning: false });

  const accessToken = projectData?.accessToken;
  const repoFullName = projectData?.fullName;

  // Build nested tree from flat structure
  const buildNestedTree = useCallback((flatTree) => {
    const root = { children: {} };
    const items = flatTree
      .filter(item => item.type === 'blob' || item.type === 'tree')
      .sort((a, b) => a.path.localeCompare(b.path));

    for (const item of items) {
      const parts = item.path.split('/');
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;

        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: parts.slice(0, i + 1).join('/'),
            type: isLast ? item.type : 'tree',
            sha: isLast ? item.sha : null,
            size: item.size,
            children: {}
          };
        }
        current = current.children[part];
      }
    }

    const toArray = (node) => {
      return Object.values(node.children)
        .map(child => ({
          ...child,
          children: child.type === 'tree' ? toArray(child) : undefined
        }))
        .sort((a, b) => {
          if (a.type === 'tree' && b.type !== 'tree') return -1;
          if (a.type !== 'tree' && b.type === 'tree') return 1;
          return a.name.localeCompare(b.name);
        });
    };

    return toArray(root);
  }, []);

  // Fetch repository tree
  const fetchTree = useCallback(async () => {
    if (!accessToken || !repoFullName) return;
    
    setIsLoadingTree(true);
    setError(null);
    const [owner, repo] = repoFullName.split('/');

    try {
      let response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
        { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' } }
      );

      if (!response.ok) {
        response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
          { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' } }
        );
      }

      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const data = await response.json();
      const nested = buildNestedTree(data.tree || []);
      setFileTree(nested);

      // Auto-expand first level
      const firstLevel = nested.filter(item => item.type === 'tree').slice(0, 3).map(item => item.path);
      setExpandedFolders(new Set(firstLevel));

      // Start scanning all scannable files
      const scannableFiles = (data.tree || []).filter(item => 
        item.type === 'blob' && 
        /\.(js|jsx|ts|tsx|py|json|yml|yaml|env|md|html|css|sh|go|rs|java|rb|php)$/i.test(item.path)
      );
      
      if (scannableFiles.length > 0) {
        scanAllFiles(scannableFiles.slice(0, 50)); // Limit to 50 files
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingTree(false);
    }
  }, [accessToken, repoFullName, buildNestedTree]);

  // Scan all files for vulnerabilities
  const scanAllFiles = async (files) => {
    setScanProgress({ current: 0, total: files.length, scanning: true });
    const issuesMap = new Map();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setScanProgress(prev => ({ ...prev, current: i + 1 }));
      
      try {
        const response = await fetch(
          `https://api.github.com/repos/${repoFullName}/contents/${file.path}`,
          { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' } }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            try {
              const content = atob(data.content.replace(/\n/g, ''));
              const issues = scanContent(content, file.path);
              if (issues.length > 0) {
                issuesMap.set(file.path, issues);
              }
            } catch (e) {
              // Binary file, skip
            }
          }
        }
      } catch (e) {
        console.error(`Error scanning ${file.path}:`, e);
      }
      
      // Small delay to avoid rate limiting
      if (i % 10 === 0) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
    
    setAllFileIssues(issuesMap);
    setScanProgress(prev => ({ ...prev, scanning: false }));
  };

  // Scan file content for security issues
  const scanContent = (content, filePath) => {
    const issues = [];
    const lines = content.split('\n');
    
    // Skip .env files from being flagged (they're supposed to have secrets)
    const isEnvFile = /\.env/.test(filePath);
    
    lines.forEach((line, lineNum) => {
      SECURITY_RULES.forEach(rule => {
        // Skip secret scanning in .env files
        if (isEnvFile && rule.category === 'secrets') return;
        
        const matches = line.match(rule.pattern);
        if (matches) {
          matches.forEach(match => {
            issues.push({
              id: `${rule.id}-${lineNum}-${match.substring(0, 10)}`,
              line: lineNum + 1,
              type: rule.type,
              severity: rule.severity,
              category: rule.category,
              message: rule.message,
              recommendation: rule.recommendation,
              match: match.substring(0, 60),
              context: line.trim().substring(0, 120)
            });
          });
        }
      });
    });
    
    return issues;
  };

  // Fetch single file content
  const fetchFileContent = async (file) => {
    setIsLoadingFile(true);
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoFullName}/contents/${file.path}`,
        { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' } }
      );
      
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const data = await response.json();
      let content = '';
      
      if (data.content) {
        try {
          content = atob(data.content.replace(/\n/g, ''));
        } catch {
          content = '[Binary file - cannot display]';
        }
      }
      
      const issues = scanContent(content, file.path);
      
      setSelectedFile({
        name: file.name,
        path: file.path,
        content,
        issues,
        url: data.html_url
      });
      
      // Update allFileIssues if we found issues
      if (issues.length > 0) {
        setAllFileIssues(prev => new Map(prev).set(file.path, issues));
      }
    } catch (err) {
      console.error('Error fetching file:', err);
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Load tree on mount
  useEffect(() => {
    if (repoFullName && accessToken) {
      fetchTree();
    }
  }, [repoFullName, accessToken, fetchTree]);

  // Toggle folder expansion
  const toggleFolder = (path) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  // File risks set for tree
  const fileRisks = useMemo(() => {
    return new Set(allFileIssues.keys());
  }, [allFileIssues]);

  // Total issue counts
  const totalCounts = useMemo(() => {
    let high = 0, medium = 0, low = 0;
    allFileIssues.forEach(issues => {
      issues.forEach(issue => {
        if (issue.severity === 'high') high++;
        else if (issue.severity === 'medium') medium++;
        else low++;
      });
    });
    return { high, medium, low, total: high + medium + low };
  }, [allFileIssues]);

  // Current file issue counts
  const currentFileCounts = useMemo(() => {
    if (!selectedFile?.issues) return { high: 0, medium: 0, low: 0 };
    return {
      high: selectedFile.issues.filter(i => i.severity === 'high').length,
      medium: selectedFile.issues.filter(i => i.severity === 'medium').length,
      low: selectedFile.issues.filter(i => i.severity === 'low').length
    };
  }, [selectedFile]);

  return (
    <div style={{ padding: '24px', height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '6px', color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={28} style={{ color: '#a855f7' }} />
          SAST Security Scanner
        </h1>
        <p style={{ color: '#8b92a8', fontSize: '14px' }}>
          Static Application Security Testing - Scan for vulnerabilities, secrets, and insecure patterns
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={20} color="#a855f7" />
          </div>
          <div>
            <p style={{ color: '#a855f7', fontSize: '24px', fontWeight: '700' }}>{allFileIssues.size}</p>
            <p style={{ color: '#8b92a8', fontSize: '11px' }}>Files with Issues</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color="#ef4444" />
          </div>
          <div>
            <p style={{ color: '#ef4444', fontSize: '24px', fontWeight: '700' }}>{totalCounts.high}</p>
            <p style={{ color: '#8b92a8', fontSize: '11px' }}>High Severity</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bug size={20} color="#f59e0b" />
          </div>
          <div>
            <p style={{ color: '#f59e0b', fontSize: '24px', fontWeight: '700' }}>{totalCounts.medium}</p>
            <p style={{ color: '#8b92a8', fontSize: '11px' }}>Medium</p>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(100, 150, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={20} color="#6496ff" />
          </div>
          <div>
            <p style={{ color: '#6496ff', fontSize: '24px', fontWeight: '700' }}>{totalCounts.low}</p>
            <p style={{ color: '#8b92a8', fontSize: '11px' }}>Low / Info</p>
          </div>
        </div>
      </div>

      {/* Scan Progress */}
      {scanProgress.scanning && (
        <div style={{ 
          marginBottom: '16px', 
          padding: '12px 16px',
          background: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Loader2 size={18} color="#a855f7" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ color: '#a855f7', fontSize: '13px' }}>
            Scanning files... {scanProgress.current} / {scanProgress.total}
          </span>
          <div style={{ 
            flex: 1, 
            height: '4px', 
            background: 'rgba(168, 85, 247, 0.2)', 
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(scanProgress.current / scanProgress.total) * 100}%`,
              height: '100%',
              background: '#a855f7',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', flex: 1, minHeight: 0 }}>
        
        {/* Left: File Tree */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ 
            padding: '14px 16px', 
            borderBottom: '1px solid rgba(100, 150, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderTree size={18} color="#a855f7" />
              <span style={{ color: '#e0e0e0', fontSize: '14px', fontWeight: '500' }}>
                File Explorer
              </span>
            </div>
            <button
              onClick={fetchTree}
              disabled={isLoadingTree}
              style={{
                padding: '4px 8px',
                background: 'transparent',
                border: '1px solid rgba(100, 150, 255, 0.2)',
                borderRadius: '4px',
                color: '#8b92a8',
                cursor: isLoadingTree ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={12} style={{ animation: isLoadingTree ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
          
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
            {isLoadingTree ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
                <Loader2 size={32} color="#a855f7" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#8b92a8', fontSize: '13px' }}>Loading repository...</p>
              </div>
            ) : error ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <AlertCircle size={32} color="#ef4444" style={{ marginBottom: '8px' }} />
                <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>
              </div>
            ) : fileTree.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                <FolderTree size={48} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <p>No files found</p>
              </div>
            ) : (
              fileTree.map(item => (
                <TreeItem
                  key={item.path}
                  item={item}
                  level={0}
                  onFileClick={fetchFileContent}
                  selectedPath={selectedFile?.path}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                  fileRisks={fileRisks}
                />
              ))
            )}
          </div>
          
          {/* Legend */}
          <div style={{ 
            padding: '10px 16px', 
            borderTop: '1px solid rgba(100, 150, 255, 0.1)',
            fontSize: '11px',
            color: '#6b7280',
            display: 'flex',
            gap: '12px'
          }}>
            <span>🔴 Has vulnerabilities</span>
            <span>⚠ Folder contains issues</span>
          </div>
        </div>

        {/* Right: Code Review Panel */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedFile ? (
            <>
              {/* File Header */}
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(100, 150, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileCode size={18} color="#a855f7" />
                  <span style={{ color: '#e0e0e0', fontSize: '14px', fontWeight: '500' }}>
                    {selectedFile.name}
                  </span>
                  
                  {/* Issue Badge */}
                  <span style={{
                    padding: '3px 10px',
                    background: selectedFile.issues.length > 0 
                      ? (currentFileCounts.high > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)')
                      : 'rgba(16, 185, 129, 0.15)',
                    border: `1px solid ${selectedFile.issues.length > 0 
                      ? (currentFileCounts.high > 0 ? '#ef4444' : '#f59e0b')
                      : '#10b981'}`,
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: selectedFile.issues.length > 0 
                      ? (currentFileCounts.high > 0 ? '#ef4444' : '#f59e0b')
                      : '#10b981',
                    fontWeight: '500'
                  }}>
                    {selectedFile.issues.length > 0 
                      ? `${selectedFile.issues.length} Issues Found` 
                      : '✓ Clean'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Severity breakdown */}
                  {selectedFile.issues.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                      {currentFileCounts.high > 0 && <span style={{ color: '#ef4444' }}>🔴 {currentFileCounts.high}</span>}
                      {currentFileCounts.medium > 0 && <span style={{ color: '#f59e0b' }}>🟠 {currentFileCounts.medium}</span>}
                      {currentFileCounts.low > 0 && <span style={{ color: '#6496ff' }}>⚪ {currentFileCounts.low}</span>}
                    </div>
                  )}
                  
                  {selectedFile.url && (
                    <a 
                      href={selectedFile.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#8b92a8', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', textDecoration: 'none' }}
                    >
                      <ExternalLink size={14} />
                      View on GitHub
                    </a>
                  )}
                  
                  <button
                    onClick={() => setSelectedFile(null)}
                    style={{
                      padding: '4px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Annotated Code */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {isLoadingFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Loader2 size={32} color="#a855f7" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : (
                  <AnnotatedCodeViewer 
                    content={selectedFile.content} 
                    issues={selectedFile.issues}
                    fileName={selectedFile.name}
                  />
                )}
              </div>
            </>
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '16px',
              color: '#6b7280'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(168, 85, 247, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Eye size={36} color="#a855f7" style={{ opacity: 0.6 }} />
              </div>
              <p style={{ fontSize: '16px', color: '#8b92a8' }}>Select a file to review</p>
              <p style={{ fontSize: '13px', maxWidth: '300px', textAlign: 'center' }}>
                Click on any file in the explorer to view its code and security analysis.
                Files with 🔴 indicators contain potential vulnerabilities.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecOps;
