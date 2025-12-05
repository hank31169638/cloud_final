import React, { useState } from 'react';
import { FileText, GitCompare, Repeat, DollarSign, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { llmOpsData } from '../data/mockData';

const LLMOps = () => {
  const [activeSubView, setActiveSubView] = useState('prompts');

  const subViews = [
    { id: 'prompts', name: 'Prompt Registry', icon: FileText },
    { id: 'router', name: 'Model Router', icon: Repeat },
    { id: 'analytics', name: 'Cost Analytics', icon: DollarSign }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1600px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#e0e0e0' }}>
          🧠 LLMOps
        </h1>
        <p style={{ color: '#8b92a8', fontSize: '16px' }}>
          Prompt management, model routing, and cost optimization
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
                background: isActive ? 'rgba(0, 212, 255, 0.15)' : 'rgba(30, 41, 66, 0.4)',
                border: isActive ? '1px solid rgba(0, 212, 255, 0.4)' : '1px solid rgba(100, 150, 255, 0.1)',
                borderRadius: '8px',
                color: isActive ? '#00d4ff' : '#8b92a8',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(30, 41, 66, 0.6)';
                  e.currentTarget.style.borderColor = 'rgba(100, 150, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(30, 41, 66, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(100, 150, 255, 0.1)';
                }
              }}
            >
              <Icon size={18} />
              {view.name}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {activeSubView === 'prompts' && <PromptRegistry />}
      {activeSubView === 'router' && <ModelRouter />}
      {activeSubView === 'analytics' && <CostAnalytics />}
    </div>
  );
};

// Prompt Registry Sub-component
const PromptRegistry = () => {
  const prompts = llmOpsData.prompts;

  return (
    <div>
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitCompare className="neon-blue" size={20} />
          Prompt Version Diff Viewer
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {prompts.map((prompt, idx) => (
            <div key={idx} className="glass-panel-dark" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '16px', color: '#e0e0e0' }}>{prompt.name}</h4>
                <span style={{
                  padding: '4px 12px',
                  background: idx === 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  border: idx === 0 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: idx === 0 ? '#f59e0b' : '#10b981',
                  fontWeight: '500'
                }}>
                  {prompt.version}
                </span>
              </div>
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid rgba(100, 150, 255, 0.1)',
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#b8c1db',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {prompt.content}
              </div>
              <p style={{ marginTop: '12px', color: '#6b7280', fontSize: '12px' }}>
                Last modified: {prompt.lastModified}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(0, 212, 255, 0.05)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#00d4ff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            📝 Changes Detected:
          </p>
          <ul style={{ color: '#8b92a8', fontSize: '13px', paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Added: "with expertise in code analysis"</li>
            <li>Added: "Provide detailed, technical responses"</li>
            <li>Added: "Always cite sources"</li>
            <li>Improved specificity for technical queries</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Model Router Sub-component
const ModelRouter = () => {
  const router = llmOpsData.modelRouter;

  return (
    <div>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#e0e0e0' }}>
          Model Fallback Configuration
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div className="glass-panel-dark" style={{ padding: '20px', flex: 1 }}>
            <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '12px' }}>Primary Model</p>
            <select style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '8px',
              color: '#00d4ff',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              <option value="gpt-4o">{router.primary}</option>
              <option value="gpt-4-turbo">gpt-4-turbo</option>
              <option value="claude-3.5-sonnet">claude-3.5-sonnet</option>
            </select>
          </div>

          <div style={{ color: '#6b7280', fontSize: '24px' }}>→</div>

          <div className="glass-panel-dark" style={{ padding: '20px', flex: 1 }}>
            <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '12px' }}>Fallback 1</p>
            <select style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(0, 255, 204, 0.3)',
              borderRadius: '8px',
              color: '#00ffcc',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              <option value="claude-3.5-sonnet">{router.fallback[0]}</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            </select>
          </div>

          <div style={{ color: '#6b7280', fontSize: '24px' }}>→</div>

          <div className="glass-panel-dark" style={{ padding: '20px', flex: 1 }}>
            <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '12px' }}>Fallback 2</p>
            <select style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '8px',
              color: '#a855f7',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              <option value="gpt-3.5-turbo">{router.fallback[1]}</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="claude-3.5-sonnet">claude-3.5-sonnet</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div className="glass-panel-dark" style={{ padding: '20px' }}>
            <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Timeout (seconds)</p>
            <input
              type="number"
              value={router.timeout}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(100, 150, 255, 0.2)',
                borderRadius: '8px',
                color: '#e0e0e0',
                fontSize: '15px'
              }}
            />
          </div>
          <div className="glass-panel-dark" style={{ padding: '20px' }}>
            <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Retry Attempts</p>
            <input
              type="number"
              value={router.retryAttempts}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(100, 150, 255, 0.2)',
                borderRadius: '8px',
                color: '#e0e0e0',
                fontSize: '15px'
              }}
            />
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)'
          }} />
          <p style={{ color: '#10b981', fontSize: '14px' }}>
            Fallback routing active • 99.8% uptime
          </p>
        </div>
      </div>
    </div>
  );
};

// Cost Analytics Sub-component
const CostAnalytics = () => {
  const data = llmOpsData.costAnalytics;
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0).toFixed(2);
  const totalRequests = data.reduce((sum, item) => sum + item.requests, 0);

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Total Cost (7 days)</p>
          <p className="neon-cyan" style={{ fontSize: '32px', fontWeight: '700' }}>
            ${totalCost}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            <TrendingUp size={16} style={{ color: '#10b981' }} />
            <span style={{ color: '#10b981', fontSize: '13px' }}>+12% vs last week</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Total Requests</p>
          <p className="neon-blue" style={{ fontSize: '32px', fontWeight: '700' }}>
            {totalRequests}
          </p>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '8px' }}>
            Avg: {Math.round(totalRequests / 7)} per day
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Avg Cost per Request</p>
          <p className="neon-purple" style={{ fontSize: '32px', fontWeight: '700' }}>
            ${(parseFloat(totalCost) / totalRequests).toFixed(4)}
          </p>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '8px' }}>
            Optimized efficiency
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#e0e0e0' }}>
          Token Usage Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 150, 255, 0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280" 
              tick={{ fill: '#8b92a8', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#6b7280" tick={{ fill: '#8b92a8', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(10, 15, 30, 0.95)', 
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                color: '#e0e0e0'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="tokens" 
              stroke="#00d4ff" 
              strokeWidth={3}
              dot={{ fill: '#00d4ff', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#e0e0e0' }}>
          Daily Cost Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 150, 255, 0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280" 
              tick={{ fill: '#8b92a8', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="#6b7280" tick={{ fill: '#8b92a8', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(10, 15, 30, 0.95)', 
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '8px',
                color: '#e0e0e0'
              }}
            />
            <Bar dataKey="cost" fill="#a855f7" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LLMOps;
