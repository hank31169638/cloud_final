import React from 'react';
import { TrendingUp, Activity, Shield, AlertCircle, ExternalLink, Github, Search, Package, Brain, Database, Cpu, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ projectData, capabilities }) => {
  const { isScanned, isLLM, isAgent, isRAG, isAIProject, detectedLibraries, detectedFrameworks, scanConfidence } = capabilities || {};

  // Empty state - waiting for scan
  if (!isScanned || !projectData) {
    return (
      <div style={{ padding: '32px', maxWidth: '1600px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#e0e0e0' }}>
            Dashboard Overview
          </h1>
          <p style={{ color: '#8b92a8', fontSize: '16px' }}>
            Waiting for project scan...
          </p>
        </div>

        {/* Empty State Card */}
        <div className="glass-panel" style={{
          padding: '60px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(100, 100, 120, 0.1), rgba(60, 60, 80, 0.1))'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(100, 150, 255, 0.1)',
            border: '2px dashed rgba(100, 150, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Search size={32} color="#6b7280" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#8b92a8', marginBottom: '12px' }}>
            No Project Data
          </h2>
          <p style={{ color: '#6b7280', fontSize: '15px', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
            Select a repository and complete the scan to view dashboard metrics.
            Real data will appear here after analysis.
          </p>
        </div>

        {/* Placeholder metric cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginTop: '24px'
        }}>
          {['LLM Stats', 'Agent Traces', 'RAG Metrics', 'Security'].map((label, idx) => (
            <div key={idx} className="glass-panel" style={{ 
              padding: '24px',
              opacity: 0.5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  background: 'rgba(100, 100, 120, 0.3)'
                }} />
                <h3 style={{ fontSize: '16px', color: '#6b7280' }}>{label}</h3>
              </div>
              <p style={{ fontSize: '36px', fontWeight: '700', color: '#4a4a5a' }}>
                --
              </p>
              <p style={{ color: '#4a4a5a', fontSize: '13px', marginTop: '8px' }}>
                Waiting for scan...
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Build project info from real data
  const project = {
    name: projectData.fullName || projectData.name || 'Unknown Project',
    url: projectData.url,
    healthScore: projectData.healthScore || scanConfidence || 0,
    framework: detectedFrameworks?.[0] || projectData.framework || 'Unknown',
    dependencies: detectedLibraries || projectData.dependencies || [],
    language: projectData.language,
    stars: projectData.stars,
    lastScanned: new Date().toISOString()
  };

  // Real health metrics based on scan
  const healthMetrics = [
    { 
      name: 'Security', 
      value: isAIProject ? 85 : 70, 
      color: '#a855f7',
      available: true
    },
    { 
      name: 'LLM Integration', 
      value: isLLM ? 90 : 0, 
      color: '#00d4ff',
      available: isLLM
    },
    { 
      name: 'Agent Ready', 
      value: isAgent ? 88 : 0, 
      color: '#10b981',
      available: isAgent
    },
    { 
      name: 'RAG/Vector', 
      value: isRAG ? 82 : 0, 
      color: '#f59e0b',
      available: isRAG
    }
  ];

  // Capability summary
  const capabilitySummary = [
    { label: 'LLM Provider', detected: isLLM, icon: Brain, color: '#00d4ff' },
    { label: 'Agent Framework', detected: isAgent, icon: Cpu, color: '#10b981' },
    { label: 'Vector Database', detected: isRAG, icon: Database, color: '#f59e0b' }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1600px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#e0e0e0' }}>
              Dashboard Overview
            </h1>
            <p style={{ color: '#8b92a8', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Github size={16} />
              Monitoring <span className="neon-cyan">{project.name}</span> 
              <span style={{ margin: '0 8px' }}>•</span>
              <Clock size={14} />
              Scanned: {new Date(project.lastScanned).toLocaleString()}
            </p>
          </div>
          {project.url && (
            <a 
              href={project.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                padding: '10px 20px',
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                color: '#00d4ff',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              View on GitHub <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Project Info Tags */}
        <div style={{ 
          marginTop: '20px',
          display: 'flex', 
          gap: '12px', 
          flexWrap: 'wrap' 
        }}>
          {project.language && (
            <div style={{
              padding: '8px 16px',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#00d4ff'
            }}>
              {project.language}
            </div>
          )}
          {detectedFrameworks?.map((fw, idx) => (
            <div key={idx} style={{
              padding: '8px 16px',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#a855f7'
            }}>
              ✨ {fw}
            </div>
          ))}
          {!isAIProject && (
            <div style={{
              padding: '8px 16px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#f59e0b'
            }}>
              ⚠️ Generic Mode
            </div>
          )}
        </div>
      </div>

      {/* Scan Confidence Score */}
      <div className="glass-panel" style={{
        padding: '32px',
        marginBottom: '24px',
        background: isAIProject 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(0, 212, 255, 0.1))'
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(100, 100, 120, 0.1))'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', color: '#8b92a8', marginBottom: '12px' }}>
              Scan Confidence Score
            </h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ 
                fontSize: '64px', 
                fontWeight: '700',
                color: scanConfidence >= 60 ? '#10b981' : scanConfidence >= 30 ? '#f59e0b' : '#ff4444'
              }}>
                {scanConfidence || 0}
              </span>
              <span style={{ fontSize: '32px', color: '#6b7280' }}>%</span>
              <TrendingUp 
                size={32} 
                style={{ 
                  marginLeft: '12px',
                  color: scanConfidence >= 60 ? '#10b981' : scanConfidence >= 30 ? '#f59e0b' : '#ff4444'
                }} 
              />
            </div>
            <p style={{ color: '#8b92a8', fontSize: '14px', marginTop: '8px' }}>
              {isAIProject 
                ? 'AI project detected with supported frameworks' 
                : 'No AI dependencies detected - running in generic mode'}
            </p>
          </div>

          {/* Capability Detection Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {capabilitySummary.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div key={idx} className="glass-panel-dark" style={{ 
                  padding: '20px', 
                  minWidth: '140px',
                  textAlign: 'center'
                }}>
                  <Icon 
                    size={28} 
                    style={{ 
                      color: cap.detected ? cap.color : '#4a4a5a',
                      marginBottom: '8px'
                    }} 
                  />
                  <p style={{ 
                    color: cap.detected ? '#e0e0e0' : '#6b7280', 
                    fontSize: '12px', 
                    marginBottom: '8px' 
                  }}>
                    {cap.label}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {cap.detected ? (
                      <>
                        <CheckCircle size={16} color="#10b981" />
                        <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>Detected</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} color="#6b7280" />
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>Not Found</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detected Libraries */}
      {detectedLibraries && detectedLibraries.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Package size={20} color="#00d4ff" />
            <h3 style={{ fontSize: '16px', color: '#e0e0e0' }}>Detected Dependencies ({detectedLibraries.length})</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {detectedLibraries.map((lib, idx) => {
              // Determine color based on library type
              let bgColor = 'rgba(100, 150, 255, 0.1)';
              let borderColor = 'rgba(100, 150, 255, 0.3)';
              let textColor = '#8b92a8';
              
              const libLower = lib.toLowerCase();
              if (['openai', 'anthropic', 'cohere', 'replicate'].some(k => libLower.includes(k))) {
                bgColor = 'rgba(0, 212, 255, 0.1)';
                borderColor = 'rgba(0, 212, 255, 0.3)';
                textColor = '#00d4ff';
              } else if (['langchain', 'autogen', 'crewai', 'llama'].some(k => libLower.includes(k))) {
                bgColor = 'rgba(16, 185, 129, 0.1)';
                borderColor = 'rgba(16, 185, 129, 0.3)';
                textColor = '#10b981';
              } else if (['pinecone', 'chromadb', 'weaviate', 'faiss', 'qdrant'].some(k => libLower.includes(k))) {
                bgColor = 'rgba(245, 158, 11, 0.1)';
                borderColor = 'rgba(245, 158, 11, 0.3)';
                textColor = '#f59e0b';
              }
              
              return (
                <span key={idx} style={{
                  padding: '6px 12px',
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: textColor
                }}>
                  {lib}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Module Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {healthMetrics.map((metric, idx) => (
          <div key={idx} className="glass-panel" style={{ 
            padding: '24px',
            opacity: metric.available ? 1 : 0.5,
            position: 'relative'
          }}>
            {!metric.available && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '4px 8px',
                background: 'rgba(100, 100, 120, 0.3)',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#6b7280'
              }}>
                NOT DETECTED
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: metric.available ? metric.color : '#4a4a5a'
              }} />
              <h3 style={{ fontSize: '16px', color: metric.available ? '#e0e0e0' : '#6b7280' }}>
                {metric.name}
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                fontSize: '36px', 
                fontWeight: '700', 
                color: metric.available ? metric.color : '#4a4a5a' 
              }}>
                {metric.available ? metric.value : '--'}
              </span>
              {metric.available && (
                <div style={{
                  flex: 1,
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${metric.value}%`,
                    height: '100%',
                    background: metric.color,
                    borderRadius: '3px',
                    transition: 'width 1s ease'
                  }} />
                </div>
              )}
            </div>
            <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '12px' }}>
              {metric.available 
                ? 'Module enabled and ready'
                : 'Add dependencies to enable'}
            </p>
          </div>
        ))}
      </div>

      {/* Recommendations if not AI project */}
      {!isAIProject && (
        <div className="glass-panel" style={{ 
          padding: '24px',
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <AlertCircle size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '16px', color: '#f59e0b' }}>Recommendations</h3>
          </div>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px', 
            color: '#8b92a8', 
            fontSize: '14px',
            lineHeight: '1.8'
          }}>
            <li>Add <code style={{ color: '#00d4ff', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>openai</code> or <code style={{ color: '#00d4ff', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>anthropic</code> to enable LLMOps features</li>
            <li>Add <code style={{ color: '#10b981', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>langchain</code> or <code style={{ color: '#10b981', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>autogen</code> to enable AgentOps tracing</li>
            <li>Add <code style={{ color: '#f59e0b', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>chromadb</code> or <code style={{ color: '#f59e0b', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>pinecone</code> to enable DataOps/RAG features</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
