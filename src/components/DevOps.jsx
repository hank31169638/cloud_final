import React, { useState } from 'react';
import { GitBranch, CheckCircle2, Clock, AlertCircle, XCircle, Play, FileCheck } from 'lucide-react';
import { devOpsData } from '../data/mockData';

const DevOps = () => {
  const [activeSubView, setActiveSubView] = useState('pipeline');

  const subViews = [
    { id: 'pipeline', name: 'Pipeline Status', icon: GitBranch },
    { id: 'validation', name: 'Validation Report', icon: FileCheck }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1600px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#e0e0e0' }}>
          ⚙️ DevOps (CI/CD)
        </h1>
        <p style={{ color: '#8b92a8', fontSize: '16px' }}>
          Continuous integration, deployment pipeline, and automated validation
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
                background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 66, 0.4)',
                border: isActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(100, 150, 255, 0.1)',
                borderRadius: '8px',
                color: isActive ? '#10b981' : '#8b92a8',
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
      {activeSubView === 'pipeline' && <PipelineStatus data={devOpsData.pipeline} />}
      {activeSubView === 'validation' && <ValidationReport data={devOpsData.validationReport} />}
    </div>
  );
};

// Pipeline Status Component
const PipelineStatus = ({ data }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={24} style={{ color: '#10b981' }} />;
      case 'running':
        return <Play size={24} style={{ color: '#00d4ff', animation: 'pulse-glow 2s infinite' }} />;
      case 'failed':
        return <XCircle size={24} className="neon-red" />;
      case 'pending':
        return <Clock size={24} style={{ color: '#6b7280' }} />;
      default:
        return <Clock size={24} style={{ color: '#6b7280' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#10b981' };
      case 'running':
        return { bg: 'rgba(0, 212, 255, 0.1)', border: '#00d4ff', text: '#00d4ff' };
      case 'failed':
        return { bg: 'rgba(255, 68, 68, 0.1)', border: '#ff4444', text: '#ff4444' };
      case 'pending':
        return { bg: 'rgba(100, 100, 100, 0.1)', border: '#6b7280', text: '#6b7280' };
      default:
        return { bg: 'rgba(100, 100, 100, 0.1)', border: '#6b7280', text: '#6b7280' };
    }
  };

  return (
    <div>
      {/* Pipeline Info */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '20px', color: '#e0e0e0', marginBottom: '8px' }}>
              Pipeline: <span className="neon-cyan">main</span> #{data.commit}
            </h3>
            <p style={{ color: '#8b92a8', fontSize: '14px' }}>
              Last run: {new Date(data.lastRun).toLocaleString()}
            </p>
          </div>
          <div style={{
            padding: '8px 16px',
            background: getStatusColor(data.status).bg,
            border: `2px solid ${getStatusColor(data.status).border}`,
            borderRadius: '8px',
            fontSize: '14px',
            color: getStatusColor(data.status).text,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {data.status}
          </div>
        </div>

        {/* Pipeline Flow Visualization */}
        <div style={{ position: 'relative' }}>
          {data.stages.map((stage, idx) => {
            const statusColor = getStatusColor(stage.status);
            const isLast = idx === data.stages.length - 1;

            return (
              <div key={idx} style={{ position: 'relative', marginBottom: isLast ? 0 : '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {/* Stage Icon & Connector */}
                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: statusColor.bg,
                      border: `2px solid ${statusColor.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: stage.status === 'running' ? `0 0 20px ${statusColor.border}60` : 'none',
                      zIndex: 1
                    }}>
                      {getStatusIcon(stage.status)}
                    </div>
                    
                    {/* Connector Line */}
                    {!isLast && (
                      <div style={{
                        width: '2px',
                        height: '44px',
                        background: stage.status === 'success' 
                          ? 'linear-gradient(180deg, #10b981, rgba(100, 150, 255, 0.2))'
                          : 'rgba(100, 150, 255, 0.2)',
                        position: 'absolute',
                        top: '56px',
                        zIndex: 0
                      }} />
                    )}
                  </div>

                  {/* Stage Info */}
                  <div className="glass-panel-dark" style={{
                    flex: 1,
                    padding: '20px',
                    borderLeft: `3px solid ${statusColor.border}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#e0e0e0', marginBottom: '6px' }}>
                          {stage.name}
                        </h4>
                        <p style={{ color: '#8b92a8', fontSize: '13px' }}>
                          {stage.timestamp !== '-' ? `Started at ${stage.timestamp}` : 'Not started'}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Duration</p>
                        <p style={{ fontSize: '18px', fontWeight: '600', color: statusColor.text }}>
                          {stage.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deployment History */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#e0e0e0' }}>
          Deployment History
        </h3>

        <div style={{ display: 'grid', gap: '12px' }}>
          {devOpsData.deploymentHistory.map((deployment, idx) => (
            <div key={idx} className="glass-panel-dark" style={{
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: deployment.status === 'deployed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  border: deployment.status === 'deployed' ? '2px solid #10b981' : '2px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {deployment.status === 'deployed' ? (
                    <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                  ) : (
                    <AlertCircle size={20} style={{ color: '#f59e0b' }} />
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#e0e0e0', marginBottom: '4px' }}>
                    {deployment.version}
                  </p>
                  <p style={{ color: '#8b92a8', fontSize: '13px' }}>
                    {deployment.environment} • {deployment.date}
                  </p>
                </div>
              </div>
              <span style={{
                padding: '6px 14px',
                background: deployment.status === 'deployed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                border: deployment.status === 'deployed' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: '12px',
                fontSize: '12px',
                color: deployment.status === 'deployed' ? '#10b981' : '#f59e0b',
                fontWeight: '500',
                textTransform: 'uppercase'
              }}>
                {deployment.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Validation Report Component
const ValidationReport = ({ data }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Safety': '#a855f7',
      'Security': '#ff4444',
      'Performance': '#00d4ff',
      'Reliability': '#10b981',
      'Integration': '#f59e0b',
      'Observability': '#00ffcc'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <CheckCircle2 size={28} style={{ color: '#10b981', margin: '0 auto 12px' }} />
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Passed</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
            {data.passed}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <XCircle size={28} className="neon-red" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Failed</p>
          <p className="neon-red" style={{ fontSize: '32px', fontWeight: '700' }}>
            {data.failed}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <AlertCircle size={28} style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Skipped</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
            {data.skipped}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <FileCheck size={28} className="neon-cyan" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Total</p>
          <p className="neon-cyan" style={{ fontSize: '32px', fontWeight: '700' }}>
            {data.total}
          </p>
        </div>
      </div>

      {/* Test Results */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#e0e0e0' }}>
          Test Results
        </h3>

        <div style={{ display: 'grid', gap: '12px' }}>
          {data.tests.map((test, idx) => {
            const statusConfig = {
              pass: { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981' },
              fail: { icon: XCircle, color: '#ff4444', bg: 'rgba(255, 68, 68, 0.1)', border: '#ff4444' },
              skip: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b' }
            };
            const status = statusConfig[test.status];
            const Icon = status.icon;
            const categoryColor = getCategoryColor(test.category);

            return (
              <div key={idx} className="glass-panel-dark" style={{
                padding: '20px',
                borderLeft: `3px solid ${status.border}`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(30, 41, 66, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(20, 30, 48, 0.6)';
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <Icon size={24} style={{ color: status.color }} />
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#e0e0e0', marginBottom: '6px' }}>
                        {test.name}
                      </h4>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{
                          padding: '2px 8px',
                          background: `${categoryColor}20`,
                          border: `1px solid ${categoryColor}40`,
                          borderRadius: '6px',
                          fontSize: '11px',
                          color: categoryColor,
                          fontWeight: '500'
                        }}>
                          {test.category}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                          Duration: {test.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '6px 14px',
                    background: status.bg,
                    border: `1px solid ${status.border}`,
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: status.color,
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {test.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pass Rate */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '24px' }}>
          <p style={{ color: '#8b92a8', fontSize: '14px', marginBottom: '12px' }}>Pass Rate</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '36px', fontWeight: '700', color: '#10b981' }}>
              {Math.round((data.passed / data.total) * 100)}%
            </span>
            <span style={{ color: '#6b7280', fontSize: '16px' }}>
              ({data.passed}/{data.total})
            </span>
          </div>
          <div style={{
            marginTop: '16px',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(data.passed / data.total) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #00ffcc)',
              borderRadius: '4px',
              transition: 'width 1s ease'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevOps;
