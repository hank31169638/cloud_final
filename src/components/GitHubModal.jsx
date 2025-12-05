import React, { useState, useEffect } from 'react';
import { Github, AlertCircle, Loader2, ExternalLink, Lock, CheckCircle, Star, GitFork, Clock, Search, AlertTriangle, Sparkles, Folder, FileCode, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';

// AI/ML library keywords to detect
const AI_KEYWORDS = [
  'openai', 'langchain', 'llama-index', 'llamaindex', 'anthropic', 
  'transformers', 'pytorch', 'torch', 'tensorflow', 'pinecone', 
  'chromadb', 'chroma', 'weaviate', 'qdrant', 'milvus',
  'huggingface', 'sentence-transformers', 'tiktoken', 'cohere',
  'replicate', 'stability-ai', 'diffusers', 'auto-gpt', 'autogen',
  'semantic-kernel', 'guidance', 'dspy', 'litellm', 'ollama'
];

// Common AI project folder patterns
const AI_FOLDER_PATTERNS = ['prompts', 'agents', 'chains', 'llm', 'models', 'embeddings', 'vectors', 'rag'];

// Common AI project file patterns
const AI_FILE_PATTERNS = ['.env.example', '.env.template', 'prompts.yaml', 'prompts.json', 'config.yaml'];

function GitHubModal({ onClose, onComplete, pendingRepo = null, existingRepos = [] }) {
  const [step, setStep] = useState('auth'); // 'auth' | 'select' | 'scanning'
  const [accessToken, setAccessToken] = useState(null);
  const [repositories, setRepositories] = useState(existingRepos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  
  // Scanning state
  const [scanningRepo, setScanningRepo] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanPhase, setScanPhase] = useState(''); // 'fetching' | 'analyzing' | 'complete'

  // Handle pending repo switch from Sidebar
  useEffect(() => {
    if (pendingRepo && accessToken) {
      handleRepoSelect(pendingRepo);
    } else if (pendingRepo && existingRepos.length > 0) {
      // Try to use existing repos without new auth
      setRepositories(existingRepos);
      setStep('select');
      handleRepoSelect(pendingRepo);
    }
  }, [pendingRepo]);

  useEffect(() => {
    // Skip if supabase is not configured
    if (!supabase) {
      console.warn('Supabase not configured - running in demo mode');
      return;
    }

    // 檢查 Supabase Auth Session
    checkAuthSession();
    
    // 監聯 Auth 狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.provider_token) {
        setAccessToken(session.provider_token);
        fetchAuthorizedRepos(session.provider_token);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthSession = async () => {
    if (!supabase) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.provider_token) {
      setAccessToken(session.provider_token);
      fetchAuthorizedRepos(session.provider_token);
    }
  };

  const initiateGitHubLogin = async () => {
    if (!supabase) {
      setError('Supabase 未設定。請先配置環境變數。');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'repo read:user',
          redirectTo: `${window.location.origin}`
        }
      });
      
      if (error) throw error;
    } catch (err) {
      console.error('GitHub login error:', err);
      setError('無法連接到 GitHub。請檢查 Supabase 設定。');
      setLoading(false);
    }
  };

  const fetchAuthorizedRepos = async (token) => {
    try {
      setLoading(true);
      setError('');
      setProgress(25);

      // 獲取使用者已授權的 repositories
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50&affiliation=owner,collaborator', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      setProgress(50);

      if (response.status === 401) {
        setError('Authentication expired. Please login again.');
        localStorage.removeItem('github_oauth_token');
        setAccessToken(null);
        setStep('auth');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      setProgress(75);

      setRepositories(data);
      setStep('select');
      setProgress(100);
      setLoading(false);

    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch repositories');
      setLoading(false);
      setProgress(0);
    }
  };

  const handleRepoSelect = async (repo) => {
    // Start scanning flow
    setScanningRepo(repo);
    setScanResult(null);
    setScanPhase('fetching');
    setStep('scanning');
    setProgress(0);

    try {
      // Run the scan
      const scanData = await scanRepositoryStructure(repo);
      setScanResult(scanData);

    } catch (err) {
      console.error('Scan error:', err);
      setScanResult({
        isAIProject: false,
        detectedFrameworks: [],
        detectedLibraries: [],
        aiPatterns: [],
        techStack: [],
        confidence: 0,
        warnings: [err.message || 'Failed to scan repository'],
        mode: 'generic'
      });
    }
  };

  /**
   * Scan repository structure to detect AI frameworks and patterns
   */
  const scanRepositoryStructure = async (repo) => {
    const fullName = repo.full_name;
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
    };

    const result = {
      isAIProject: false,
      detectedFrameworks: [],
      detectedLibraries: [],
      aiPatterns: [],
      techStack: [],
      confidence: 0,
      warnings: [],
      mode: 'standard' // 'standard' | 'generic'
    };

    try {
      // Phase 1: Fetch root directory contents
      setScanPhase('fetching');
      setProgress(10);

      const contentsResponse = await fetch(
        `https://api.github.com/repos/${fullName}/contents`,
        { headers }
      );

      if (!contentsResponse.ok) {
        throw new Error(`Failed to fetch repository contents: ${contentsResponse.status}`);
      }

      const contents = await contentsResponse.json();
      const files = Array.isArray(contents) ? contents : [];
      const fileNames = files.map(f => f.name.toLowerCase());
      const folderNames = files.filter(f => f.type === 'dir').map(f => f.name.toLowerCase());

      setProgress(25);

      // Phase 2: Check for AI folder patterns
      const matchedFolders = folderNames.filter(folder => 
        AI_FOLDER_PATTERNS.some(pattern => folder.includes(pattern))
      );
      if (matchedFolders.length > 0) {
        result.aiPatterns.push(...matchedFolders.map(f => `/${f} folder`));
        result.confidence += matchedFolders.length * 10;
      }

      // Check for AI file patterns
      const matchedFiles = fileNames.filter(file =>
        AI_FILE_PATTERNS.some(pattern => file.includes(pattern.toLowerCase()))
      );
      if (matchedFiles.length > 0) {
        result.aiPatterns.push(...matchedFiles);
        result.confidence += matchedFiles.length * 5;
      }

      setProgress(40);
      setScanPhase('analyzing');

      // Phase 3: Fetch and analyze dependency files
      const dependencyFiles = [
        { name: 'requirements.txt', type: 'python' },
        { name: 'pyproject.toml', type: 'python' },
        { name: 'package.json', type: 'javascript' },
        { name: 'Pipfile', type: 'python' },
        { name: 'environment.yml', type: 'python' },
        { name: 'setup.py', type: 'python' }
      ];

      for (const depFile of dependencyFiles) {
        const fileEntry = files.find(f => f.name.toLowerCase() === depFile.name.toLowerCase());
        if (fileEntry) {
          result.techStack.push(depFile.type === 'python' ? 'Python' : 'JavaScript/Node.js');
          
          try {
            const fileResponse = await fetch(fileEntry.download_url);
            const fileContent = await fileResponse.text();
            const contentLower = fileContent.toLowerCase();

            // Check for AI libraries
            for (const keyword of AI_KEYWORDS) {
              if (contentLower.includes(keyword)) {
                if (!result.detectedLibraries.includes(keyword)) {
                  result.detectedLibraries.push(keyword);
                  result.confidence += 15;
                }
              }
            }

            // Identify primary frameworks
            if (contentLower.includes('langchain')) {
              result.detectedFrameworks.push('LangChain');
            }
            if (contentLower.includes('llama-index') || contentLower.includes('llamaindex')) {
              result.detectedFrameworks.push('LlamaIndex');
            }
            if (contentLower.includes('openai')) {
              result.detectedFrameworks.push('OpenAI');
            }
            if (contentLower.includes('anthropic')) {
              result.detectedFrameworks.push('Anthropic');
            }
            if (contentLower.includes('transformers') || contentLower.includes('huggingface')) {
              result.detectedFrameworks.push('HuggingFace');
            }
            if (contentLower.includes('autogen')) {
              result.detectedFrameworks.push('AutoGen');
            }
            if (contentLower.includes('semantic-kernel')) {
              result.detectedFrameworks.push('Semantic Kernel');
            }

          } catch (err) {
            console.warn(`Could not fetch ${depFile.name}:`, err);
          }
        }
      }

      setProgress(70);

      // Phase 4: Additional heuristics - check for common AI files
      const pythonFiles = files.filter(f => f.name.endsWith('.py'));
      if (pythonFiles.length > 0 && !result.techStack.includes('Python')) {
        result.techStack.push('Python');
      }

      // Check for Jupyter notebooks
      const notebooks = files.filter(f => f.name.endsWith('.ipynb'));
      if (notebooks.length > 0) {
        result.aiPatterns.push('Jupyter Notebooks');
        result.confidence += 10;
      }

      // Check for Dockerfile
      if (fileNames.includes('dockerfile') || fileNames.includes('docker-compose.yml') || fileNames.includes('docker-compose.yaml')) {
        result.techStack.push('Docker');
      }

      // Phase 4.5: Extract System Prompt from repo
      result.systemPrompt = null;
      const promptFiles = ['system_prompt.txt', 'prompts.py', 'prompt.txt', 'system_message.txt'];
      
      for (const promptFileName of promptFiles) {
        const promptFile = files.find(f => f.name.toLowerCase() === promptFileName.toLowerCase());
        if (promptFile) {
          try {
            const promptResponse = await fetch(promptFile.download_url);
            const promptContent = await promptResponse.text();
            result.systemPrompt = promptContent;
            result.promptSource = promptFileName;
            break;
          } catch (err) {
            console.warn(`Could not fetch ${promptFileName}:`, err);
          }
        }
      }

      // If no dedicated prompt file, look for SYSTEM_MESSAGE in main.py or app.py
      if (!result.systemPrompt) {
        const mainFiles = ['main.py', 'app.py', 'agent.py', 'bot.py'];
        for (const mainFileName of mainFiles) {
          const mainFile = files.find(f => f.name.toLowerCase() === mainFileName.toLowerCase());
          if (mainFile) {
            try {
              const mainResponse = await fetch(mainFile.download_url);
              const mainContent = await mainResponse.text();
              
              // Look for SYSTEM_MESSAGE, SYSTEM_PROMPT, or system_prompt variable
              const patterns = [
                /SYSTEM_MESSAGE\s*=\s*['"]{1,3}([\s\S]*?)['"]{1,3}/,
                /SYSTEM_PROMPT\s*=\s*['"]{1,3}([\s\S]*?)['"]{1,3}/,
                /system_prompt\s*=\s*['"]{1,3}([\s\S]*?)['"]{1,3}/,
                /system_message\s*=\s*['"]{1,3}([\s\S]*?)['"]{1,3}/
              ];
              
              for (const pattern of patterns) {
                const match = mainContent.match(pattern);
                if (match && match[1]) {
                  result.systemPrompt = match[1].trim();
                  result.promptSource = `${mainFileName} (extracted)`;
                  break;
                }
              }
              
              if (result.systemPrompt) break;
            } catch (err) {
              console.warn(`Could not fetch ${mainFileName}:`, err);
            }
          }
        }
      }

      setProgress(85);

      // Phase 5: Determine final result
      result.detectedFrameworks = [...new Set(result.detectedFrameworks)];
      result.detectedLibraries = [...new Set(result.detectedLibraries)];
      result.techStack = [...new Set(result.techStack)];

      // Determine if it's an AI project
      result.isAIProject = result.detectedFrameworks.length > 0 || 
                           result.detectedLibraries.length >= 2 ||
                           result.confidence >= 30;

      result.confidence = Math.min(result.confidence, 100);
      result.mode = result.isAIProject ? 'standard' : 'generic';

      if (!result.isAIProject) {
        result.warnings.push('No standard AI/ML dependencies detected');
        if (result.techStack.length === 0) {
          result.warnings.push('Could not determine technology stack');
        }
      }

      setProgress(100);
      setScanPhase('complete');

      return result;

    } catch (err) {
      console.error('Scan error:', err);
      result.warnings.push(err.message);
      result.mode = 'generic';
      setScanPhase('complete');
      return result;
    }
  };

  const handleImportProject = async () => {
    if (!scanningRepo || !scanResult) return;

    setLoading(true);

    const analysis = await analyzeRepository(scanningRepo.full_name, accessToken);

    onComplete({
      name: scanningRepo.name,
      fullName: scanningRepo.full_name,
      url: scanningRepo.html_url,
      description: scanningRepo.description,
      language: scanningRepo.language,
      stars: scanningRepo.stargazers_count,
      framework: scanResult.detectedFrameworks[0] || analysis.framework,
      healthScore: analysis.healthScore,
      dependencies: [...new Set([...scanResult.detectedLibraries, ...analysis.dependencies])],
      aiPatterns: [...new Set([...scanResult.aiPatterns, ...analysis.aiPatterns])],
      recommendations: analysis.recommendations,
      techStack: scanResult.techStack,
      detectedFrameworks: scanResult.detectedFrameworks,
      isAIProject: scanResult.isAIProject,
      scanConfidence: scanResult.confidence,
      mode: scanResult.mode,
      // System prompt extraction
      systemPrompt: scanResult.systemPrompt,
      promptSource: scanResult.promptSource,
      // Pass accessToken for API calls
      accessToken: accessToken
    }, repositories); // Pass repositories list to parent
  };

  const handleBackToSelect = () => {
    setStep('select');
    setScanningRepo(null);
    setScanResult(null);
    setScanPhase('');
    setProgress(0);
  };

  const analyzeRepository = async (fullName, token) => {
    try {
      const headers = { 'Accept': 'application/vnd.github.v3+json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const contentsResponse = await fetch(`https://api.github.com/repos/${fullName}/contents`, {
        headers
      });

      const contents = await contentsResponse.json();
      const files = Array.isArray(contents) ? contents.map(f => f.name.toLowerCase()) : [];

      let framework = 'Unknown';
      const dependencies = [];
      const aiPatterns = [];

      if (files.includes('requirements.txt')) {
        framework = 'Python';
        dependencies.push('requirements.txt');
        
        const reqFile = contents.find(f => f.name === 'requirements.txt');
        if (reqFile) {
          const reqResponse = await fetch(reqFile.download_url);
          const reqText = await reqResponse.text();
          
          if (reqText.includes('langchain')) aiPatterns.push('LangChain');
          if (reqText.includes('openai')) aiPatterns.push('OpenAI');
          if (reqText.includes('anthropic')) aiPatterns.push('Anthropic');
          if (reqText.includes('fastapi')) dependencies.push('FastAPI');
          if (reqText.includes('streamlit')) dependencies.push('Streamlit');
        }
      }

      if (files.includes('package.json')) {
        framework = 'JavaScript';
        dependencies.push('package.json');
      }

      if (files.includes('dockerfile') || files.includes('docker-compose.yml')) {
        dependencies.push('Docker');
      }

      let healthScore = 65;
      if (files.includes('readme.md')) healthScore += 10;
      if (files.includes('.gitignore')) healthScore += 5;
      if (dependencies.includes('Docker')) healthScore += 10;
      if (aiPatterns.length > 0) healthScore += 10;

      const recommendations = [];
      if (!aiPatterns.length) recommendations.push('Consider adding AI framework integration');
      if (!dependencies.includes('Docker')) recommendations.push('Add Docker for deployment');
      if (healthScore < 80) recommendations.push('Improve documentation and testing');

      return {
        framework,
        healthScore: Math.min(healthScore, 100),
        dependencies,
        aiPatterns,
        recommendations
      };

    } catch (err) {
      console.error('Analysis error:', err);
      return {
        framework: 'Unknown',
        healthScore: 70,
        dependencies: [],
        aiPatterns: [],
        recommendations: ['Enable repository analysis by granting appropriate permissions']
      };
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAccessToken(null);
    setRepositories([]);
    setStep('auth');
    setError('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 66, 0.95))',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 212, 255, 0.1)',
        border: '1px solid rgba(100, 150, 255, 0.2)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#8b92a8',
            fontSize: '20px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            e.target.style.color = '#8b92a8';
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0, 212, 255, 0.3)'
          }}>
            <Github size={32} color="#0a0e1a" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #00d4ff, #fff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {step === 'auth' ? 'Connect GitHub' : step === 'scanning' ? 'Scanning Repository' : 'Select Repository'}
            </h2>
            <p style={{
              margin: '4px 0 0 0',
              color: '#8b92a8',
              fontSize: '14px'
            }}>
              {step === 'auth' 
                ? 'Authorize Nexus AI to access your repositories' 
                : step === 'scanning'
                  ? scanningRepo?.name || 'Analyzing project structure...'
                  : `${repositories.length} authorized repositories`}
            </p>
          </div>
            {step === 'select' && (
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 68, 68, 0.1)',
                  border: '1px solid rgba(255, 68, 68, 0.3)',
                  borderRadius: '6px',
                  color: '#ff6b6b',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 68, 68, 0.1)';
                }}
              >
                Logout
              </button>
            )}
            {step === 'scanning' && (
              <button
                onClick={handleBackToSelect}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(100, 150, 255, 0.1)',
                  border: '1px solid rgba(100, 150, 255, 0.3)',
                  borderRadius: '6px',
                  color: '#8b92a8',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(100, 150, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(100, 150, 255, 0.1)';
                }}
              >
                ← Back
              </button>
            )}
        </div>

        {/* Content Section */}
        {!loading ? (
          <div>
            {/* Step 1: GitHub OAuth Login */}
            {step === 'auth' && (
              <>
                <div style={{
                  marginBottom: '32px',
                  padding: '24px',
                  background: 'rgba(0, 212, 255, 0.05)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <Lock size={48} color="#00d4ff" style={{ marginBottom: '16px' }} />
                  <h3 style={{ margin: '0 0 12px 0', color: '#e0e0e0', fontSize: '18px', fontWeight: '600' }}>
                    Why Authorize?
                  </h3>
                  <ul style={{ 
                    textAlign: 'left', 
                    color: '#8b92a8', 
                    fontSize: '14px', 
                    lineHeight: '1.8',
                    paddingLeft: '24px',
                    margin: 0
                  }}>
                    <li>✅ Choose which repositories to share</li>
                    <li>✅ Access both public and private repos</li>
                    <li>✅ Real-time code analysis</li>
                    <li>✅ Revoke access anytime from GitHub settings</li>
                  </ul>
                </div>

                {error && (
                  <div style={{
                    marginBottom: '20px',
                    padding: '12px',
                    background: 'rgba(255, 68, 68, 0.1)',
                    border: '1px solid rgba(255, 68, 68, 0.3)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={18} color="#ff4444" />
                    <span style={{ color: '#ff6b6b', fontSize: '14px' }}>{error}</span>
                  </div>
                )}

                <button
                  onClick={initiateGitHubLogin}
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: 'linear-gradient(135deg, #238636, #2ea043)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '17px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(35, 134, 54, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 30px rgba(35, 134, 54, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 20px rgba(35, 134, 54, 0.4)';
                  }}
                >
                  <Github size={24} />
                  Sign in with GitHub
                </button>

                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  background: 'rgba(168, 85, 247, 0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#8b92a8',
                  lineHeight: '1.6'
                }}>
                  🔒 <strong>Secure OAuth 2.0:</strong> You'll be redirected to GitHub where you can select which repositories to grant access to. Your credentials are never shared with us.
                </div>

                <div style={{
                  marginTop: '16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  Need to set up OAuth? Visit{' '}
                  <a 
                    href="https://github.com/settings/developers" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#00d4ff', textDecoration: 'none' }}
                  >
                    GitHub Developer Settings
                  </a>
                </div>
              </>
            )}

            {/* Step 2: Repository Selection */}
            {step === 'select' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '16px',
                maxHeight: '60vh',
                overflowY: 'auto',
                padding: '4px'
              }}>
                {repositories.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => handleRepoSelect(repo)}
                    style={{
                      padding: '20px',
                      background: 'rgba(30, 41, 66, 0.4)',
                      border: '1px solid rgba(100, 150, 255, 0.2)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(30, 41, 66, 0.6)';
                      e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 212, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(30, 41, 66, 0.4)';
                      e.currentTarget.style.borderColor = 'rgba(100, 150, 255, 0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                      <Github size={20} color="#00d4ff" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#e0e0e0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {repo.name}
                        </h3>
                        {repo.private && (
                          <span style={{
                            display: 'inline-block',
                            marginTop: '4px',
                            padding: '2px 8px',
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid rgba(255, 68, 68, 0.3)',
                            borderRadius: '4px',
                            fontSize: '11px',
                            color: '#ff6b6b'
                          }}>
                            Private
                          </span>
                        )}
                      </div>
                      {repo.language && (
                        <div style={{
                          padding: '4px 10px',
                          background: 'rgba(0, 212, 255, 0.1)',
                          border: '1px solid rgba(0, 212, 255, 0.3)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#00d4ff',
                          whiteSpace: 'nowrap'
                        }}>
                          {repo.language}
                        </div>
                      )}
                    </div>
                    <p style={{
                      margin: 0,
                      color: '#8b92a8',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {repo.description || 'No description available'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={14} /> {repo.stargazers_count}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <GitFork size={14} /> {repo.forks_count}
                      </span>
                      {repo.updated_at && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Scanning Repository */}
            {step === 'scanning' && (
              <div style={{ padding: '20px 0' }}>
                {/* Scanning Animation - Show while scanning */}
                {!scanResult && (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto 24px',
                      position: 'relative'
                    }}>
                      <Search 
                        size={40} 
                        color="#00d4ff" 
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          animation: 'pulse 1.5s ease-in-out infinite'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        border: '3px solid rgba(0, 212, 255, 0.2)',
                        borderTopColor: '#00d4ff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                    </div>
                    
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#e0e0e0'
                    }}>
                      Scanning Project Structure...
                    </h3>
                    <p style={{ color: '#8b92a8', fontSize: '14px', margin: '0 0 24px 0' }}>
                      {scanPhase === 'fetching' ? 'Fetching repository contents...' : 'Analyzing dependencies and patterns...'}
                    </p>

                    {/* Progress Bar */}
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(100, 150, 255, 0.2)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
                        width: `${progress}%`,
                        transition: 'width 0.3s ease',
                        borderRadius: '3px'
                      }} />
                    </div>

                    {/* Scan Phases */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '16px',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      <span style={{ color: progress >= 25 ? '#00d4ff' : '#6b7280' }}>
                        ✓ Fetch Contents
                      </span>
                      <span style={{ color: progress >= 50 ? '#00d4ff' : '#6b7280' }}>
                        ✓ Check Folders
                      </span>
                      <span style={{ color: progress >= 75 ? '#00d4ff' : '#6b7280' }}>
                        ✓ Analyze Deps
                      </span>
                      <span style={{ color: progress >= 100 ? '#00d4ff' : '#6b7280' }}>
                        ✓ Complete
                      </span>
                    </div>
                  </div>
                )}

                {/* Scan Results */}
                {scanResult && (
                  <div>
                    {/* Result Header */}
                    <div style={{
                      padding: '24px',
                      background: scanResult.isAIProject 
                        ? 'rgba(16, 185, 129, 0.1)' 
                        : 'rgba(245, 158, 11, 0.1)',
                      border: `1px solid ${scanResult.isAIProject ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      borderRadius: '12px',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>
                      {scanResult.isAIProject ? (
                        <>
                          <CheckCircle size={48} color="#10b981" style={{ marginBottom: '12px' }} />
                          <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#10b981'
                          }}>
                            AI Framework Detected!
                          </h3>
                          <p style={{ color: '#8b92a8', fontSize: '14px', margin: 0 }}>
                            {scanResult.detectedFrameworks.length > 0 
                              ? `Found: ${scanResult.detectedFrameworks.join(' + ')}`
                              : `Detected ${scanResult.detectedLibraries.length} AI/ML libraries`}
                          </p>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: '12px' }} />
                          <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#f59e0b'
                          }}>
                            No Standard AI Dependencies Found
                          </h3>
                          <p style={{ color: '#8b92a8', fontSize: '14px', margin: 0 }}>
                            Import anyway? Project will run in Generic Mode.
                          </p>
                        </>
                      )}
                    </div>

                    {/* Detected Items */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      marginBottom: '24px'
                    }}>
                      {/* Frameworks */}
                      <div style={{
                        padding: '16px',
                        background: 'rgba(30, 41, 66, 0.4)',
                        border: '1px solid rgba(100, 150, 255, 0.2)',
                        borderRadius: '10px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px',
                          color: '#a855f7'
                        }}>
                          <Sparkles size={18} />
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>AI Frameworks</span>
                        </div>
                        {scanResult.detectedFrameworks.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {scanResult.detectedFrameworks.map((fw, i) => (
                              <span key={i} style={{
                                padding: '4px 10px',
                                background: 'rgba(168, 85, 247, 0.2)',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#a855f7'
                              }}>
                                {fw}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '13px' }}>None detected</span>
                        )}
                      </div>

                      {/* Libraries */}
                      <div style={{
                        padding: '16px',
                        background: 'rgba(30, 41, 66, 0.4)',
                        border: '1px solid rgba(100, 150, 255, 0.2)',
                        borderRadius: '10px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px',
                          color: '#00d4ff'
                        }}>
                          <Package size={18} />
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>Libraries</span>
                        </div>
                        {scanResult.detectedLibraries.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {scanResult.detectedLibraries.slice(0, 6).map((lib, i) => (
                              <span key={i} style={{
                                padding: '4px 10px',
                                background: 'rgba(0, 212, 255, 0.1)',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#00d4ff'
                              }}>
                                {lib}
                              </span>
                            ))}
                            {scanResult.detectedLibraries.length > 6 && (
                              <span style={{
                                padding: '4px 10px',
                                background: 'rgba(100, 150, 255, 0.1)',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#8b92a8'
                              }}>
                                +{scanResult.detectedLibraries.length - 6} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '13px' }}>None detected</span>
                        )}
                      </div>

                      {/* Patterns */}
                      <div style={{
                        padding: '16px',
                        background: 'rgba(30, 41, 66, 0.4)',
                        border: '1px solid rgba(100, 150, 255, 0.2)',
                        borderRadius: '10px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px',
                          color: '#10b981'
                        }}>
                          <Folder size={18} />
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>AI Patterns</span>
                        </div>
                        {scanResult.aiPatterns.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {scanResult.aiPatterns.map((pattern, i) => (
                              <span key={i} style={{
                                padding: '4px 10px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#10b981'
                              }}>
                                {pattern}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '13px' }}>None detected</span>
                        )}
                      </div>

                      {/* Tech Stack */}
                      <div style={{
                        padding: '16px',
                        background: 'rgba(30, 41, 66, 0.4)',
                        border: '1px solid rgba(100, 150, 255, 0.2)',
                        borderRadius: '10px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px',
                          color: '#f59e0b'
                        }}>
                          <FileCode size={18} />
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>Tech Stack</span>
                        </div>
                        {scanResult.techStack.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {scanResult.techStack.map((tech, i) => (
                              <span key={i} style={{
                                padding: '4px 10px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#f59e0b'
                              }}>
                                {tech}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '13px' }}>Unknown</span>
                        )}
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'rgba(30, 41, 66, 0.4)',
                      border: '1px solid rgba(100, 150, 255, 0.2)',
                      borderRadius: '8px',
                      marginBottom: '24px'
                    }}>
                      <span style={{ color: '#8b92a8', fontSize: '13px' }}>Detection Confidence</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '120px',
                          height: '6px',
                          background: 'rgba(100, 150, 255, 0.2)',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${scanResult.confidence}%`,
                            height: '100%',
                            background: scanResult.confidence >= 60 
                              ? '#10b981' 
                              : scanResult.confidence >= 30 
                                ? '#f59e0b' 
                                : '#ff4444',
                            borderRadius: '3px',
                            transition: 'width 0.5s ease'
                          }} />
                        </div>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: scanResult.confidence >= 60 
                            ? '#10b981' 
                            : scanResult.confidence >= 30 
                              ? '#f59e0b' 
                              : '#ff4444'
                        }}>
                          {scanResult.confidence}%
                        </span>
                      </div>
                    </div>

                    {/* Mode Tag */}
                    {!scanResult.isAIProject && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 16px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '8px',
                        marginBottom: '24px'
                      }}>
                        <AlertTriangle size={18} color="#f59e0b" />
                        <span style={{ color: '#f59e0b', fontSize: '13px' }}>
                          This project will be imported in <strong>Generic Mode</strong>. Some AI-specific features may be limited.
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={handleBackToSelect}
                        style={{
                          flex: 1,
                          padding: '14px 24px',
                          background: 'rgba(100, 150, 255, 0.1)',
                          border: '1px solid rgba(100, 150, 255, 0.3)',
                          borderRadius: '10px',
                          color: '#8b92a8',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(100, 150, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'rgba(100, 150, 255, 0.1)';
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleImportProject}
                        disabled={loading}
                        style={{
                          flex: 2,
                          padding: '14px 24px',
                          background: scanResult.isAIProject
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : 'linear-gradient(135deg, #f59e0b, #d97706)',
                          border: 'none',
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.7 : 1,
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: scanResult.isAIProject
                            ? '0 4px 20px rgba(16, 185, 129, 0.4)'
                            : '0 4px 20px rgba(245, 158, 11, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.target.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            Importing...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            {scanResult.isAIProject ? 'Import Project' : 'Import Anyway'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Loading State
          <div style={{
            textAlign: 'center',
            padding: '40px 20px'
          }}>
            <Loader2 size={48} color="#00d4ff" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{
              marginTop: '24px',
              color: '#8b92a8',
              fontSize: '16px'
            }}>
              {step === 'token' ? 'Fetching repositories...' : 'Analyzing repository...'}
            </p>
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(100, 150, 255, 0.2)',
              borderRadius: '2px',
              marginTop: '20px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #00d4ff, #0099cc)',
                width: `${progress}%`,
                transition: 'width 0.3s ease',
                borderRadius: '2px'
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GitHubModal;
