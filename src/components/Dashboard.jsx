import React, { useEffect, useState } from 'react';
import { TrendingUp, Activity, Shield, AlertCircle, ExternalLink, Github } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockProjects, llmOpsData } from '../data/mockData';

const Dashboard = () => {
  const [project, setProject] = useState(null);

  useEffect(() => {
    // Load project from localStorage
    const savedProject = localStorage.getItem('nexus_project');
    if (savedProject) {
      const projectData = JSON.parse(savedProject);
      setProject({
        name: projectData.fullName || projectData.name,
        url: projectData.url,
        healthScore: projectData.healthScore,
        framework: projectData.framework,
        dependencies: projectData.dependencies || [],
        aiPatterns: projectData.aiPatterns || [],
        recommendations: projectData.recommendations || [],
        language: projectData.language,
        stars: projectData.stars,
        lastScanned: new Date().toISOString()
      });
    } else {
      // Fallback to mock data
      setProject(mockProjects[0]);
    }
  }, []);

  if (!project) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#8b92a8' }}>
        Loading project data...
      </div>
    );
  }

  const healthMetrics = [
    { name: 'Security', value: 92, color: '#a855f7' },
    { name: 'Performance', value: 85, color: '#00d4ff' },
    { name: 'Reliability', value: 88, color: '#10b981' },
    { name: 'Cost Efficiency', value: 81, color: '#f59e0b' }
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
              Monitoring <span className="neon-cyan">{project.name}</span> • Last scanned: {new Date(project.lastScanned).toLocaleString()}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
              }}
            >
              View on GitHub <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Project Info Cards */}
        {(project.framework || project.language || project.aiPatterns?.length > 0) && (
          <div style={{ 
            marginTop: '20px',
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap' 
          }}>
            {project.framework && project.framework !== 'Unknown' && (
              <div style={{
                padding: '8px 16px',
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#a855f7'
              }}>
                Framework: {project.framework}
              </div>
            )}
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
            {project.aiPatterns?.map((pattern, idx) => (
              <div key={idx} style={{
                padding: '8px 16px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#10b981'
              }}>
                ✨ {pattern}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Health Score Card */}
      <div className="glass-panel" style={{
        padding: '32px',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(168, 85, 247, 0.1))'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', color: '#8b92a8', marginBottom: '12px' }}>
              Overall Health Score
            </h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="neon-cyan" style={{ fontSize: '64px', fontWeight: '700' }}>
                {project.healthScore}
              </span>
              <span style={{ fontSize: '32px', color: '#6b7280' }}>/100</span>
              <TrendingUp className="neon-cyan" size={32} style={{ marginLeft: '12px' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {healthMetrics.map((metric, idx) => (
              <div key={idx} className="glass-panel-dark" style={{ padding: '20px', minWidth: '160px' }}>
                <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>
                  {metric.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: `${metric.color}20`,
                    border: `2px solid ${metric.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: metric.color
                  }}>
                    {metric.value}
                  </div>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Activity className="neon-blue" size={24} />
            <h3 style={{ fontSize: '16px', color: '#e0e0e0' }}>Active Tools</h3>
          </div>
          <p className="neon-blue" style={{ fontSize: '36px', fontWeight: '700' }}>
            {project.toolCount}
          </p>
          <p style={{ color: '#8b92a8', fontSize: '13px', marginTop: '8px' }}>
            6 active, 2 disabled
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Shield className="neon-purple" size={24} />
            <h3 style={{ fontSize: '16px', color: '#e0e0e0' }}>Guardrails</h3>
          </div>
          <p className="neon-purple" style={{ fontSize: '36px', fontWeight: '700' }}>
            {project.activeGuardrails}
          </p>
          <p style={{ color: '#8b92a8', fontSize: '13px', marginTop: '8px' }}>
            25 threats blocked today
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <AlertCircle style={{ color: '#f59e0b' }} size={24} />
            <h3 style={{ fontSize: '16px', color: '#e0e0e0' }}>System Prompts</h3>
          </div>
          <p style={{ fontSize: '36px', fontWeight: '700', color: '#f59e0b' }}>
            {project.promptCount}
          </p>
          <p style={{ color: '#8b92a8', fontSize: '13px', marginTop: '8px' }}>
            2 versions detected
          </p>
        </div>
      </div>

      {/* Cost Analytics Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#e0e0e0' }}>
          Token Usage & Cost Trend (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={llmOpsData.costAnalytics}>
            <defs>
              <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 150, 255, 0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280" 
              tick={{ fill: '#8b92a8', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#6b7280" 
              tick={{ fill: '#8b92a8', fontSize: 12 }}
              yAxisId="left"
            />
            <YAxis 
              stroke="#6b7280" 
              tick={{ fill: '#8b92a8', fontSize: 12 }}
              yAxisId="right"
              orientation="right"
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(10, 15, 30, 0.95)', 
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                color: '#e0e0e0'
              }}
            />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="tokens" 
              stroke="#00d4ff" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorTokens)" 
            />
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="cost" 
              stroke="#a855f7" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCost)" 
            />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: '32px', marginTop: '16px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#00d4ff' }} />
            <span style={{ color: '#8b92a8', fontSize: '13px' }}>Tokens Used</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#a855f7' }} />
            <span style={{ color: '#8b92a8', fontSize: '13px' }}>Cost ($)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
