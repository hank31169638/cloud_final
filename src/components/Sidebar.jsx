import React from 'react';
import { Brain, Activity, Shield, Database, GitBranch, ChevronRight } from 'lucide-react';

const Sidebar = ({ activeModule, onModuleChange }) => {
  const modules = [
    { id: 'llmops', name: 'LLMOps', icon: Brain, color: '#00d4ff' },
    { id: 'agentops', name: 'AgentOps', icon: Activity, color: '#00ffcc' },
    { id: 'secops', name: 'AI SecOps', icon: Shield, color: '#a855f7' },
    { id: 'dataops', name: 'DataOps', icon: Database, color: '#f59e0b' },
    { id: 'devops', name: 'DevOps', icon: GitBranch, color: '#10b981' }
  ];

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      background: 'rgba(10, 15, 30, 0.95)',
      borderRight: '1px solid rgba(100, 150, 255, 0.1)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '40px', paddingLeft: '12px' }}>
        <h2 className="neon-blue" style={{
          fontSize: '24px',
          fontWeight: '700',
          letterSpacing: '0.5px',
          marginBottom: '4px'
        }}>
          Nexus AI
        </h2>
        <p style={{ color: '#6b7280', fontSize: '12px', letterSpacing: '0.3px' }}>
          X-Ops Platform
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => onModuleChange(module.id)}
              style={{
                width: '100%',
                padding: '14px 16px',
                marginBottom: '8px',
                background: isActive 
                  ? 'rgba(0, 212, 255, 0.1)' 
                  : 'transparent',
                border: isActive
                  ? '1px solid rgba(0, 212, 255, 0.3)'
                  : '1px solid transparent',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                color: isActive ? module.color : '#8b92a8'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(30, 41, 66, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(100, 150, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={20} />
                <span style={{
                  fontSize: '15px',
                  fontWeight: isActive ? '600' : '500'
                }}>
                  {module.name}
                </span>
              </div>
              {isActive && <ChevronRight size={18} />}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="glass-panel-dark" style={{
        padding: '16px',
        marginTop: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
            animation: 'pulse-glow 2s infinite'
          }} />
          <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '500' }}>
            System Online
          </span>
        </div>
        <p style={{ color: '#6b7280', fontSize: '12px', lineHeight: '1.5' }}>
          agent-bot
          <br />
          Health Score: <span className="neon-cyan">87%</span>
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
