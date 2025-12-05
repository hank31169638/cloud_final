import React, { useState } from 'react';
import { Activity, Wrench, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { agentOpsData } from '../data/mockData';

const AgentOps = () => {
  const [activeSubView, setActiveSubView] = useState('traces');
  const [selectedTrace, setSelectedTrace] = useState(agentOpsData.traces[0]);

  const subViews = [
    { id: 'traces', name: 'Trace Observability', icon: Activity },
    { id: 'tools', name: 'Tool Registry', icon: Wrench }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1600px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#e0e0e0' }}>
          🕵️ AgentOps
        </h1>
        <p style={{ color: '#8b92a8', fontSize: '16px' }}>
          Agent execution traces, tool management, and performance monitoring
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
                background: isActive ? 'rgba(0, 255, 204, 0.15)' : 'rgba(30, 41, 66, 0.4)',
                border: isActive ? '1px solid rgba(0, 255, 204, 0.4)' : '1px solid rgba(100, 150, 255, 0.1)',
                borderRadius: '8px',
                color: isActive ? '#00ffcc' : '#8b92a8',
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
      {activeSubView === 'traces' && (
        <TraceObservability 
          traces={agentOpsData.traces} 
          selectedTrace={selectedTrace}
          setSelectedTrace={setSelectedTrace}
        />
      )}
      {activeSubView === 'tools' && <ToolRegistry tools={agentOpsData.tools} />}
    </div>
  );
};

// Trace Observability - Waterfall Chart
const TraceObservability = ({ traces, selectedTrace, setSelectedTrace }) => {
  return (
    <div>
      {/* Trace Selector */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {traces.map((trace) => (
          <button
            key={trace.id}
            onClick={() => setSelectedTrace(trace)}
            style={{
              padding: '16px 20px',
              background: selectedTrace.id === trace.id ? 'rgba(0, 255, 204, 0.1)' : 'rgba(30, 41, 66, 0.4)',
              border: selectedTrace.id === trace.id ? '1px solid rgba(0, 255, 204, 0.3)' : '1px solid rgba(100, 150, 255, 0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              minWidth: '200px',
              textAlign: 'left',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle2 size={16} style={{ color: '#10b981' }} />
              <span style={{ color: '#e0e0e0', fontSize: '13px', fontWeight: '500' }}>
                {trace.id}
              </span>
            </div>
            <p style={{ color: '#8b92a8', fontSize: '12px', marginBottom: '4px' }}>
              {trace.userInput.substring(0, 40)}...
            </p>
            <p style={{ color: '#6b7280', fontSize: '11px' }}>
              {new Date(trace.timestamp).toLocaleTimeString()}
            </p>
          </button>
        ))}
      </div>

      {/* Waterfall Visualization */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', color: '#e0e0e0' }}>
            Execution Waterfall
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} className="neon-cyan" />
              <span className="neon-cyan" style={{ fontSize: '14px', fontWeight: '500' }}>
                Total: {selectedTrace.totalDuration}ms
              </span>
            </div>
            <div style={{
              padding: '6px 12px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#10b981',
              fontWeight: '500'
            }}>
              {selectedTrace.status}
            </div>
          </div>
        </div>

        {/* User Input */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'rgba(0, 212, 255, 0.05)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#00d4ff', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
            📥 User Input
          </p>
          <p style={{ color: '#e0e0e0', fontSize: '14px' }}>
            {selectedTrace.userInput}
          </p>
        </div>

        {/* Waterfall Steps */}
        <div style={{ position: 'relative' }}>
          {selectedTrace.steps.map((step, idx) => {
            const colors = {
              thought: { bg: 'rgba(0, 212, 255, 0.1)', border: '#00d4ff', bar: '#00d4ff' },
              tool_call: { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', bar: '#f59e0b' },
              response: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', bar: '#10b981' }
            };
            const color = colors[step.type];
            const widthPercent = (step.duration / selectedTrace.totalDuration) * 100;
            const leftPercent = (step.startTime / selectedTrace.totalDuration) * 100;

            return (
              <div key={idx} style={{ marginBottom: '16px' }}>
                {/* Step Info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                  paddingLeft: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      fontWeight: '500',
                      minWidth: '20px'
                    }}>
                      {idx + 1}.
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      background: color.bg,
                      border: `1px solid ${color.border}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: color.border,
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {step.type.replace('_', ' ')}
                    </span>
                    <span style={{ color: '#8b92a8', fontSize: '13px' }}>
                      {step.type === 'tool_call' 
                        ? `${step.tool}(${Object.keys(step.params || {}).join(', ')})`
                        : step.content?.substring(0, 50) + (step.content?.length > 50 ? '...' : '')
                      }
                    </span>
                  </div>
                  <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: '500' }}>
                    {step.duration}ms
                  </span>
                </div>

                {/* Timeline Bar */}
                <div style={{
                  height: '32px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '6px',
                  position: 'relative',
                  overflow: 'visible'
                }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      height: '100%',
                      background: color.bar,
                      borderRadius: '6px',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#0a0e1a',
                      boxShadow: `0 0 20px ${color.bar}60`
                    }}
                  >
                    {widthPercent > 15 && `${step.duration}ms`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline Scale */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(100, 150, 255, 0.1)',
          color: '#6b7280',
          fontSize: '11px'
        }}>
          <span>0ms</span>
          <span>{Math.round(selectedTrace.totalDuration / 2)}ms</span>
          <span>{selectedTrace.totalDuration}ms</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#00d4ff' }} />
          <span style={{ color: '#8b92a8', fontSize: '13px' }}>Agent Thought</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#f59e0b' }} />
          <span style={{ color: '#8b92a8', fontSize: '13px' }}>Tool Call</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#10b981' }} />
          <span style={{ color: '#8b92a8', fontSize: '13px' }}>Final Response</span>
        </div>
      </div>
    </div>
  );
};

// Tool Registry Component
const ToolRegistry = ({ tools }) => {
  return (
    <div>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#e0e0e0' }}>
          Available Tools
        </h3>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {tools.map((tool, idx) => (
            <div key={idx} className="glass-panel-dark" style={{
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 255, 204, 0.3)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(100, 150, 255, 0.15)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                {/* Toggle Switch */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '48px',
                    height: '26px',
                    borderRadius: '13px',
                    background: tool.active ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 100, 100, 0.3)',
                    border: `2px solid ${tool.active ? '#10b981' : '#4b5563'}`,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: tool.active ? '#10b981' : '#6b7280',
                      position: 'absolute',
                      top: '2px',
                      left: tool.active ? '24px' : '2px',
                      transition: 'all 0.3s ease',
                      boxShadow: tool.active ? '0 0 10px rgba(16, 185, 129, 0.6)' : 'none'
                    }} />
                  </div>
                </div>

                {/* Tool Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: tool.active ? '#e0e0e0' : '#6b7280',
                      fontFamily: 'monospace'
                    }}>
                      {tool.name}
                    </h4>
                    <span style={{
                      padding: '2px 8px',
                      background: tool.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                      border: `1px solid ${tool.active ? 'rgba(16, 185, 129, 0.4)' : 'rgba(100, 100, 100, 0.4)'}`,
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: tool.active ? '#10b981' : '#6b7280',
                      fontWeight: '500'
                    }}>
                      {tool.active ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '13px' }}>
                    {tool.callCount} calls • Avg duration: {tool.avgDuration}ms
                  </p>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '24px', paddingRight: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#8b92a8', fontSize: '12px', marginBottom: '4px' }}>Calls</p>
                    <p className="neon-cyan" style={{ fontSize: '20px', fontWeight: '600' }}>
                      {tool.callCount}
                    </p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#8b92a8', fontSize: '12px', marginBottom: '4px' }}>Avg Time</p>
                    <p className="neon-blue" style={{ fontSize: '20px', fontWeight: '600' }}>
                      {tool.avgDuration}ms
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Total Tools</p>
          <p className="neon-cyan" style={{ fontSize: '28px', fontWeight: '700' }}>{tools.length}</p>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Active</p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
            {tools.filter(t => t.active).length}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Total Calls</p>
          <p className="neon-blue" style={{ fontSize: '28px', fontWeight: '700' }}>
            {tools.reduce((sum, t) => sum + t.callCount, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentOps;
