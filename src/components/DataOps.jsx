import React, { useState } from 'react';
import { Database, Upload, BarChart3, FileText, CheckCircle, Clock } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { dataOpsData } from '../data/mockData';

const DataOps = () => {
  const [activeSubView, setActiveSubView] = useState('knowledge');

  const subViews = [
    { id: 'knowledge', name: 'Knowledge Base', icon: Database },
    { id: 'retrieval', name: 'Retrieval Eval', icon: BarChart3 }
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1600px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#e0e0e0' }}>
          📚 DataOps
        </h1>
        <p style={{ color: '#8b92a8', fontSize: '16px' }}>
          Knowledge base management and RAG performance evaluation
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
                background: isActive ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 66, 0.4)',
                border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(100, 150, 255, 0.1)',
                borderRadius: '8px',
                color: isActive ? '#f59e0b' : '#8b92a8',
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
      {activeSubView === 'knowledge' && <KnowledgeBase data={dataOpsData.knowledgeBase} />}
      {activeSubView === 'retrieval' && <RetrievalEval data={dataOpsData.retrievalEval} />}
    </div>
  );
};

// Knowledge Base Component
const KnowledgeBase = ({ data }) => {
  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <FileText size={28} style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Total Files</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
            {data.files.length}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <Database size={28} className="neon-cyan" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Total Chunks</p>
          <p className="neon-cyan" style={{ fontSize: '32px', fontWeight: '700' }}>
            {data.totalChunks}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <BarChart3 size={28} className="neon-blue" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#8b92a8', fontSize: '13px', marginBottom: '8px' }}>Total Size</p>
          <p className="neon-blue" style={{ fontSize: '32px', fontWeight: '700' }}>
            {data.totalSize}
          </p>
        </div>
      </div>

      {/* File Upload Simulation */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#e0e0e0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={20} style={{ color: '#f59e0b' }} />
          Upload Documents
        </h3>
        
        <div style={{
          border: '2px dashed rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          background: 'rgba(245, 158, 11, 0.05)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.6)';
          e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
          e.currentTarget.style.background = 'rgba(245, 158, 11, 0.05)';
        }}
        >
          <Upload size={48} style={{ color: '#f59e0b', margin: '0 auto 16px' }} />
          <p style={{ color: '#e0e0e0', fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
            Drop files here or click to browse
          </p>
          <p style={{ color: '#8b92a8', fontSize: '13px' }}>
            Supports PDF, DOCX, TXT, MD • Max 50MB per file
          </p>
        </div>
      </div>

      {/* File List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#e0e0e0' }}>
          Indexed Documents
        </h3>

        <div style={{ display: 'grid', gap: '12px' }}>
          {data.files.map((file, idx) => (
            <div key={idx} className="glass-panel-dark" style={{
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(100, 150, 255, 0.15)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <FileText size={24} style={{ color: '#f59e0b' }} />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#e0e0e0', marginBottom: '4px' }}>
                    {file.name}
                  </h4>
                  <p style={{ color: '#6b7280', fontSize: '12px' }}>
                    {file.size} • {file.chunks} chunks • Uploaded {file.uploadedAt}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {file.status === 'indexed' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={18} style={{ color: '#10b981' }} />
                    <span style={{ color: '#10b981', fontSize: '13px', fontWeight: '500' }}>
                      Indexed
                    </span>
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={18} style={{ color: '#f59e0b' }} />
                    <span style={{ color: '#f59e0b', fontSize: '13px', fontWeight: '500' }}>
                      Processing
                    </span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Retrieval Eval Component
const RetrievalEval = ({ data }) => {
  const radialData = [
    {
      name: 'Hit Rate',
      value: data.hitRate * 100,
      fill: '#00d4ff'
    }
  ];

  return (
    <div>
      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {/* Hit Rate Radial Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', color: '#8b92a8', textAlign: 'center' }}>
            Hit Rate
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="70%" 
              outerRadius="100%" 
              data={radialData} 
              startAngle={90} 
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar 
                background={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                dataKey="value" 
                cornerRadius={10}
                fill="#00d4ff"
              />
              <text 
                x="50%" 
                y="50%" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="neon-blue"
                style={{ fontSize: '48px', fontWeight: '700' }}
              >
                {data.hitRate * 100}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
          <p style={{ textAlign: 'center', color: '#8b92a8', fontSize: '13px', marginTop: '12px' }}>
            Percentage of queries returning relevant results
          </p>
        </div>

        {/* Other Metrics */}
        <div style={{ display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gap: '12px' }}>
          <div className="glass-panel-dark" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#8b92a8', fontSize: '14px' }}>MRR (Mean Reciprocal Rank)</span>
            <span className="neon-cyan" style={{ fontSize: '20px', fontWeight: '600' }}>
              {data.mrr}
            </span>
          </div>
          <div className="glass-panel-dark" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#8b92a8', fontSize: '14px' }}>Precision</span>
            <span className="neon-blue" style={{ fontSize: '20px', fontWeight: '600' }}>
              {data.precision}
            </span>
          </div>
          <div className="glass-panel-dark" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#8b92a8', fontSize: '14px' }}>Recall</span>
            <span style={{ fontSize: '20px', fontWeight: '600', color: '#10b981' }}>
              {data.recall}
            </span>
          </div>
          <div className="glass-panel-dark" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#8b92a8', fontSize: '14px' }}>Avg Latency</span>
            <span style={{ fontSize: '20px', fontWeight: '600', color: '#f59e0b' }}>
              {data.avgLatency}ms
            </span>
          </div>
        </div>
      </div>

      {/* Hit Rate Trend */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#e0e0e0' }}>
          Hit Rate Trend (Last 7 Days)
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.dailyStats}>
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
              domain={[0.7, 0.85]}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(10, 15, 30, 0.95)', 
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                color: '#e0e0e0'
              }}
              formatter={(value) => `${(value * 100).toFixed(1)}%`}
            />
            <Line 
              type="monotone" 
              dataKey="hitRate" 
              stroke="#00d4ff" 
              strokeWidth={3}
              dot={{ fill: '#00d4ff', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sample Queries */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#e0e0e0' }}>
          Recent Query Performance
        </h3>

        <div style={{ display: 'grid', gap: '12px' }}>
          {data.queries.map((query, idx) => (
            <div key={idx} className="glass-panel-dark" style={{
              padding: '16px',
              borderLeft: `3px solid ${query.relevant ? '#10b981' : '#ff4444'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <p style={{ color: '#e0e0e0', fontSize: '14px', flex: 1 }}>
                  {query.query}
                </p>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 10px',
                    background: query.relevant ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 68, 68, 0.2)',
                    border: `1px solid ${query.relevant ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 68, 68, 0.4)'}`,
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: query.relevant ? '#10b981' : '#ff4444',
                    fontWeight: '500'
                  }}>
                    {query.relevant ? 'RELEVANT' : 'NOT RELEVANT'}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#8b92a8', fontSize: '11px' }}>Rank</p>
                    <p className="neon-cyan" style={{ fontSize: '16px', fontWeight: '600' }}>
                      #{query.rank}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#8b92a8', fontSize: '11px' }}>Score</p>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#f59e0b' }}>
                      {query.score}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataOps;
