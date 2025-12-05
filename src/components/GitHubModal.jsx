import React, { useState, useEffect } from 'react';
import { Github, AlertCircle, Loader2, ExternalLink, Lock, CheckCircle, Star, GitFork, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

function GitHubModal({ onClose, onComplete }) {
  const [step, setStep] = useState('auth'); // 'auth' | 'select'
  const [accessToken, setAccessToken] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 檢查 Supabase Auth Session
    checkAuthSession();
    
    // 監聽 Auth 狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.provider_token) {
        setAccessToken(session.provider_token);
        fetchAuthorizedRepos(session.provider_token);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.provider_token) {
      setAccessToken(session.provider_token);
      fetchAuthorizedRepos(session.provider_token);
    }
  };

  const initiateGitHubLogin = async () => {
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
    setLoading(true);
    setProgress(0);

    try {
      setProgress(25);

      // Analyze repository structure
      const analysis = await analyzeRepository(repo.full_name, accessToken);
      setProgress(100);

      setTimeout(() => {
        onComplete({
          name: repo.name,
          fullName: repo.full_name,
          url: repo.html_url,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          framework: analysis.framework,
          healthScore: analysis.healthScore,
          dependencies: analysis.dependencies,
          aiPatterns: analysis.aiPatterns,
          recommendations: analysis.recommendations
        });
      }, 500);

    } catch (err) {
      console.error('Selection error:', err);
      setError(err.message || 'Failed to analyze repository');
      setLoading(false);
      setProgress(0);
    }
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
    await supabase.auth.signOut();
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
              {step === 'auth' ? 'Connect GitHub' : 'Select Repository'}
            </h2>
            <p style={{
              margin: '4px 0 0 0',
              color: '#8b92a8',
              fontSize: '14px'
            }}>
              {step === 'auth' ? 'Authorize Nexus AI to access your repositories' : `${repositories.length} authorized repositories`}
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
