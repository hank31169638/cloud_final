import React, { useState } from 'react';
import { Shield, Sliders, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { secOpsData } from '../data/mockData';

const SecOps = () => {
  const [activeSubView, setActiveSubView] = useState('guardrails');

  const subViews = [
    { id: 'guardrails', name: 'Guardrails', icon: Sliders },
    { id: 'logs', name: 'Security Logs', icon: FileText }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1600px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#e0e0e0' }}>
          🛡️ AI SecOps
        </h1>
        <p style={{ color: '#8b92a8', fontSize: '16px' }}>
          Security guardrails, threat detection, and compliance monitoring
        </p>
      </div>

      {/* Sub-navigation */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {subViews.map((view) => {
          const Icon = view.icon;
          const isActive = activeSubView === view.id;
          
          return (
            <button
              key={view.id}
              onClick={() => setActiveSubView(view.id)}
              style={{
                padding: '12px 24px',
                background: isActive ? 'rgba(168, 85, 247, 0.15)' : 'rgba(30, 41, 66, 0.4)',
                border: isActive ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(100, 150, 255, 0.1)',
                borderRadius: '8px',
                color: isActive ? '#a855f7' : '#8b92a8',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
            >
              <Icon size={18} />
              {view.name}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {activeSubView === 'guardrails' && <Guardrails data={secOpsData.guardrails} />}
      {activeSubView === 'logs' && <SecurityLogs logs={secOpsData.securityLogs} />}
    </div>
  );
};

// Guardrails Component
const Guardrails = ({ data }) => {
  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Active Guardrails</p>
          <p className="neon-purple" style={{ fontSize: '32px', fontWeight: '700' }}>
            {data.filter(g => g.enabled).length}/{data.length}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Threats Blocked</p>
          <p className="neon-red" style={{ fontSize: '32px', fontWeight: '700' }}>
            {data.reduce((sum, g) => sum + (g.blocked || 0), 0)}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>PII Masked</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
            {data.find(g => g.name === 'PII Masking')?.masked || 0}
          </p>
        </div>
      </div>

      {/* Guardrail Controls */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '24px', color: '#e0e0e0' }}>
          Guardrail Configuration
        </h3>

        <div style={{ display: 'grid', gap: '20px' }}>
          {data.map((guardrail, idx) => (
            <div key={idx} className="glass-panel-dark" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Shield size={20} className="neon-purple" />
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#e0e0e0' }}>
                      {guardrail.name}
                    </h4>
                    <span style={{
                      padding: '2px 8px',
                      background: guardrail.enabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                      border: `1px solid ${guardrail.enabled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(100, 100, 100, 0.4)'}`,
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: guardrail.enabled ? '#10b981' : '#6b7280',
                      fontWeight: '500'
                    }}>
                      {guardrail.enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </div>
                  {guardrail.blocked !== undefined && (
                    <p style={{ color: '#8b92a8', fontSize: '13px' }}>
                      Blocked: <span className="neon-red">{guardrail.blocked}</span> incidents
                    </p>
                  )}
                  {guardrail.masked !== undefined && (
                    <p style={{ color: '#8b92a8', fontSize: '13px' }}>
                      Masked: <span style={{ color: '#10b981' }}>{guardrail.masked}</span> instances
                    </p>
                  )}
                  {guardrail.limited !== undefined && (
                    <p style={{ color: '#8b92a8', fontSize: '13px' }}>
                      Limited: <span style={{ color: '#f59e0b' }}>{guardrail.limited}</span> responses
                    </p>
                  )}
                </div>

                {/* Toggle */}
                <div style={{
                  width: '48px',
                  height: '26px',
                  borderRadius: '13px',
                  background: guardrail.enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 100, 100, 0.3)',
                  border: `2px solid ${guardrail.enabled ? '#10b981' : '#4b5563'}`,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: guardrail.enabled ? '#10b981' : '#6b7280',
                    position: 'absolute',
                    top: '2px',
                    left: guardrail.enabled ? '24px' : '2px',
                    transition: 'all 0.3s ease',
                    boxShadow: guardrail.enabled ? '0 0 10px rgba(16, 185, 129, 0.6)' : 'none'
                  }} />
                </div>
              </div>

              {/* Threshold Slider */}
              {guardrail.threshold !== undefined && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ color: '#8b92a8', fontSize: '13px' }}>
                      Threshold
                    </label>
                    <span className="neon-purple" style={{ fontSize: '14px', fontWeight: '600' }}>
                      {guardrail.threshold}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={guardrail.threshold}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${guardrail.threshold * 100}%, rgba(255, 255, 255, 0.1) ${guardrail.threshold * 100}%, rgba(255, 255, 255, 0.1) 100%)`,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>Permissive</span>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>Strict</span>
                  </div>
                </div>
              )}

              {/* Max Tokens Input */}
              {guardrail.maxTokens !== undefined && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ color: '#8b92a8', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={guardrail.maxTokens}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '6px',
                      color: '#e0e0e0',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Security Logs Component
const SecurityLogs = ({ logs }) => {
  const getSeverityColor = (severity) => {
    const colors = {
      high: { bg: 'rgba(255, 68, 68, 0.1)', border: '#ff4444', text: '#ff4444' },
      medium: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', text: '#f59e0b' },
      low: { bg: 'rgba(100, 150, 255, 0.1)', border: '#6496ff', text: '#6496ff' }
    };
    return colors[severity] || colors.low;
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <AlertTriangle size={24} className="neon-red" style={{ margin: '0 auto 8px' }} />
          <p style={{ color: '#8b92a8', fontSize: '12px', marginBottom: '4px' }}>High Severity</p>
          <p className="neon-red" style={{ fontSize: '24px', fontWeight: '700' }}>
            {logs.filter(l => l.severity === 'high').length}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <AlertTriangle size={24} style={{ color: '#f59e0b', margin: '0 auto 8px' }} />
          <p style={{ color: '#8b92a8', fontSize: '12px', marginBottom: '4px' }}>Medium Severity</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
            {logs.filter(l => l.severity === 'medium').length}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <XCircle size={24} className="neon-red" style={{ margin: '0 auto 8px' }} />
          <p style={{ color: '#8b92a8', fontSize: '12px', marginBottom: '4px' }}>Blocked</p>
          <p className="neon-red" style={{ fontSize: '24px', fontWeight: '700' }}>
            {logs.filter(l => l.blocked).length}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <CheckCircle size={24} style={{ color: '#10b981', margin: '0 auto 8px' }} />
          <p style={{ color: '#8b92a8', fontSize: '12px', marginBottom: '4px' }}>Handled</p>
          <p style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
            {logs.filter(l => !l.blocked).length}
          </p>
        </div>
      </div>

      {/* Log Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#e0e0e0' }}>
          Recent Security Events
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(100, 150, 255, 0.1)' }}>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>
                  Timestamp
                </th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>
                  Type
                </th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>
                  Severity
                </th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ textAlign: 'left', padding: '12px', color: '#6b7280', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>
                  Reason
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const severityColor = getSeverityColor(log.severity);
                return (
                  <tr key={log.id} className="glass-panel-dark" style={{
                    borderLeft: `3px solid ${severityColor.border}`,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(30, 41, 66, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(20, 30, 48, 0.6)';
                  }}
                  >
                    <td style={{ padding: '16px', color: '#8b92a8', fontSize: '13px' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        background: 'rgba(0, 212, 255, 0.1)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#00d4ff',
                        fontWeight: '500'
                      }}>
                        {log.type}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        background: severityColor.bg,
                        border: `1px solid ${severityColor.border}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: severityColor.text,
                        fontWeight: '500',
                        textTransform: 'uppercase'
                      }}>
                        {log.severity}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {log.blocked ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <XCircle size={16} className="neon-red" />
                          <span className="neon-red" style={{ fontSize: '13px', fontWeight: '500' }}>
                            Blocked
                          </span>
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={16} style={{ color: '#10b981' }} />
                          <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '500' }}>
                            Handled
                          </span>
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px', color: '#b8c1db', fontSize: '13px' }}>
                      {log.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecOps;
