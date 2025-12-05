import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen,
  FileText,
  FileCode,
  FileJson,
  File,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// File icon mapping based on extension
const getFileIcon = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const iconProps = { size: 16, style: { flexShrink: 0 } };
  
  const iconMap = {
    // Python
    py: { icon: FileCode, color: '#3776ab' },
    pyw: { icon: FileCode, color: '#3776ab' },
    pyx: { icon: FileCode, color: '#3776ab' },
    
    // JavaScript/TypeScript
    js: { icon: FileCode, color: '#f7df1e' },
    jsx: { icon: FileCode, color: '#61dafb' },
    ts: { icon: FileCode, color: '#3178c6' },
    tsx: { icon: FileCode, color: '#3178c6' },
    mjs: { icon: FileCode, color: '#f7df1e' },
    
    // Web
    html: { icon: FileCode, color: '#e34c26' },
    css: { icon: FileCode, color: '#1572b6' },
    scss: { icon: FileCode, color: '#cc6699' },
    vue: { icon: FileCode, color: '#42b883' },
    svelte: { icon: FileCode, color: '#ff3e00' },
    
    // Data
    json: { icon: FileJson, color: '#cbcb41' },
    yaml: { icon: FileText, color: '#cb171e' },
    yml: { icon: FileText, color: '#cb171e' },
    toml: { icon: FileText, color: '#9c4121' },
    xml: { icon: FileCode, color: '#f16529' },
    csv: { icon: FileText, color: '#237346' },
    
    // Documentation
    md: { icon: FileText, color: '#083fa1' },
    mdx: { icon: FileText, color: '#083fa1' },
    txt: { icon: FileText, color: '#8b92a8' },
    rst: { icon: FileText, color: '#8b92a8' },
    
    // Config
    env: { icon: FileText, color: '#ecd53f' },
    gitignore: { icon: FileText, color: '#f05032' },
    dockerfile: { icon: FileText, color: '#2496ed' },
    
    // Shell
    sh: { icon: FileCode, color: '#4eaa25' },
    bash: { icon: FileCode, color: '#4eaa25' },
    zsh: { icon: FileCode, color: '#4eaa25' },
    ps1: { icon: FileCode, color: '#012456' },
    
    // Other languages
    go: { icon: FileCode, color: '#00add8' },
    rs: { icon: FileCode, color: '#dea584' },
    rb: { icon: FileCode, color: '#cc342d' },
    java: { icon: FileCode, color: '#b07219' },
    kt: { icon: FileCode, color: '#a97bff' },
    swift: { icon: FileCode, color: '#f05138' },
    c: { icon: FileCode, color: '#555555' },
    cpp: { icon: FileCode, color: '#f34b7d' },
    h: { icon: FileCode, color: '#555555' },
    hpp: { icon: FileCode, color: '#f34b7d' },
    
    // Default
    default: { icon: File, color: '#8b92a8' }
  };

  const config = iconMap[ext] || iconMap.default;
  const Icon = config.icon;
  
  return <Icon {...iconProps} color={config.color} />;
};

// Single tree item component
const TreeItem = ({ item, level = 0, onFileClick, selectedPath, expandedFolders, toggleFolder }) => {
  const isFolder = item.type === 'tree';
  const isExpanded = expandedFolders.has(item.path);
  const isSelected = selectedPath === item.path;
  
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
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 8px',
          paddingLeft: `${12 + level * 16}px`,
          background: isSelected ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
          border: 'none',
          borderLeft: isSelected ? '2px solid #00d4ff' : '2px solid transparent',
          cursor: 'pointer',
          color: isSelected ? '#00d4ff' : '#c0c8dc',
          fontSize: '13px',
          textAlign: 'left',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'rgba(30, 41, 66, 0.5)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        {/* Expand/Collapse chevron for folders */}
        {isFolder ? (
          isExpanded ? (
            <ChevronDown size={14} style={{ flexShrink: 0, color: '#6b7280' }} />
          ) : (
            <ChevronRight size={14} style={{ flexShrink: 0, color: '#6b7280' }} />
          )
        ) : (
          <span style={{ width: '14px' }} />
        )}
        
        {/* Icon */}
        {isFolder ? (
          isExpanded ? (
            <FolderOpen size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
          ) : (
            <Folder size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
          )
        ) : (
          getFileIcon(item.name)
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
        
        {/* Size indicator for files */}
        {!isFolder && item.size && (
          <span style={{ 
            fontSize: '10px', 
            color: '#6b7280',
            flexShrink: 0
          }}>
            {formatFileSize(item.size)}
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

// Main FileTreeExplorer component
const FileTreeExplorer = ({ 
  repoFullName, 
  accessToken, 
  onFileSelect,
  selectedFilePath,
  height = '400px',
  title = 'File Explorer'
}) => {
  const [fileTree, setFileTree] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [selectedPath, setSelectedPath] = useState(selectedFilePath || null);

  // Fetch file tree on mount
  useEffect(() => {
    if (repoFullName && accessToken) {
      fetchTree();
    }
  }, [repoFullName, accessToken]);

  const fetchTree = async () => {
    if (!accessToken || !repoFullName) {
      setError('Missing repository or access token');
      return;
    }

    setIsLoading(true);
    setError(null);

    const [owner, repo] = repoFullName.split('/');

    try {
      // Try main branch first
      let response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      // Try master if main fails
      if (!response.ok) {
        response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      const nested = buildNestedTree(data.tree || []);
      setFileTree(nested);

      // Auto-expand first level folders
      const firstLevelFolders = nested
        .filter(item => item.type === 'tree')
        .slice(0, 3)
        .map(item => item.path);
      setExpandedFolders(new Set(firstLevelFolders));

    } catch (err) {
      console.error('Tree fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Build nested tree from flat structure
  const buildNestedTree = (flatTree) => {
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
  };

  const toggleFolder = (path) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleFileClick = async (file) => {
    setSelectedPath(file.path);
    
    if (onFileSelect) {
      // Fetch file content
      try {
        const response = await fetch(
          `https://api.github.com/repos/${repoFullName}/contents/${file.path}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
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

        onFileSelect({
          name: file.name,
          path: file.path,
          content,
          size: data.size,
          sha: data.sha,
          url: data.html_url
        });
      } catch (err) {
        console.error('Error fetching file:', err);
      }
    }
  };

  return (
    <div className="glass-panel" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(100, 150, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Folder size={18} color="#f59e0b" />
          <span style={{ color: '#e0e0e0', fontSize: '14px', fontWeight: '500' }}>
            {title}
          </span>
        </div>
        <button
          onClick={fetchTree}
          disabled={isLoading}
          style={{
            padding: '4px 8px',
            background: 'transparent',
            border: '1px solid rgba(100, 150, 255, 0.2)',
            borderRadius: '4px',
            color: '#8b92a8',
            cursor: isLoading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px'
          }}
        >
          <RefreshCw size={12} style={{ 
            animation: isLoading ? 'spin 1s linear infinite' : 'none' 
          }} />
          Refresh
        </button>
      </div>

      {/* Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            gap: '12px',
            color: '#8b92a8'
          }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '13px' }}>Loading file tree...</span>
          </div>
        ) : error ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            gap: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <AlertCircle size={32} color="#ef4444" />
            <span style={{ color: '#ef4444', fontSize: '13px' }}>{error}</span>
            <button
              onClick={fetchTree}
              style={{
                padding: '8px 16px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Retry
            </button>
          </div>
        ) : fileTree.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#6b7280',
            fontSize: '13px'
          }}>
            No files found
          </div>
        ) : (
          <div style={{ padding: '8px 0' }}>
            {fileTree.map((item) => (
              <TreeItem
                key={item.path}
                item={item}
                level={0}
                onFileClick={handleFileClick}
                selectedPath={selectedPath}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))}
          </div>
        )}
      </div>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FileTreeExplorer;
