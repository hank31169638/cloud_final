import React, { useState } from 'react';
import { Shield, LayoutDashboard, ChevronRight, ChevronDown, FolderGit2, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

const Sidebar = ({ activeModule, onModuleChange, projectData = null, repositories = [], onProjectSwitch, isScanning = false, scanResults = null }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 只保留 Dashboard 和 SecOps
  const modules = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      color: '#00d4ff'
    },
    { 
      id: 'secops', 
      name: 'AI SecOps', 
      icon: Shield, 
      color: '#a855f7',
      badge: scanResults?.totalIssues > 0 ? scanResults.totalIssues : null
    }
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
      {/* Brand Header */}
      <div style={{ paddingLeft: '12px', marginBottom: '20px' }}>
        <h2 className="neon-blue" style={{
          fontSize: '22px',
          fontWeight: '700',
          letterSpacing: '0.5px',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Shield size={24} color="#a855f7" />
          SecOps AI
        </h2>
        <p style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '0.3px' }}>
          Static Application Security Testing
        </p>
      </div>

      {/* Workspace Switcher Dropdown */}
      {repositories.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={isScanning}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(20, 30, 50, 0.8)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: isScanning ? 'wait' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: isScanning ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isScanning) {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                e.currentTarget.style.background = 'rgba(20, 30, 50, 0.95)';
              }
            }}
            onMouseLeave={(e) => {
              if (!dropdownOpen) {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.2)';
                e.currentTarget.style.background = 'rgba(20, 30, 50, 0.8)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              {isScanning ? (
                <Loader2 size={18} color="#a855f7" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              ) : (
                <FolderGit2 size={18} color="#a855f7" style={{ flexShrink: 0 }} />
              )}
              <div style={{ overflow: 'hidden' }}>
                <p style={{ 
                  color: '#e0e0e0', 
                  fontSize: '13px', 
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {isScanning ? 'Scanning...' : (projectData?.name || 'Select Project')}
                </p>
                {projectData?.fullName && !isScanning && (
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '10px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {projectData.fullName.split('/')[0]}
                  </p>
                )}
              </div>
            </div>
            <ChevronDown 
              size={16} 
              color="#8b92a8" 
              style={{ 
                flexShrink: 0,
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} 
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && !isScanning && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              background: 'rgba(15, 20, 35, 0.98)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: '10px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              zIndex: 1000,
              maxHeight: '280px',
              overflowY: 'auto'
            }}>
              <div style={{ padding: '8px' }}>
                <p style={{ 
                  padding: '8px 10px', 
                  color: '#6b7280', 
                  fontSize: '10px', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Select Repository to Scan
                </p>
                {repositories.map((repo) => {
                  const isCurrentRepo = repo.full_name === projectData?.fullName;
                  return (
                    <button
                      key={repo.id || repo.full_name}
                      onClick={() => {
                        if (!isCurrentRepo) {
                          setDropdownOpen(false);
                          onProjectSwitch(repo.full_name);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: isCurrentRepo ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: isCurrentRepo ? 'default' : 'pointer',
                        transition: 'background 0.15s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrentRepo) {
                          e.currentTarget.style.background = 'rgba(30, 41, 66, 0.6)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrentRepo) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <FolderGit2 
                        size={16} 
                        color={isCurrentRepo ? '#a855f7' : '#6b7280'} 
                      />
                      <div style={{ overflow: 'hidden', flex: 1 }}>
                        <p style={{ 
                          color: isCurrentRepo ? '#a855f7' : '#e0e0e0', 
                          fontSize: '13px',
                          fontWeight: isCurrentRepo ? '500' : '400',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {repo.name}
                        </p>
                        <p style={{ 
                          color: '#6b7280', 
                          fontSize: '10px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {repo.full_name.split('/')[0]}
                        </p>
                      </div>
                      {isCurrentRepo && (
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#a855f7',
                          boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)'
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fallback when no repos */}
      {repositories.length === 0 && (
        <div style={{
          padding: '12px 14px',
          marginBottom: '20px',
          background: 'rgba(20, 30, 50, 0.5)',
          border: '1px solid rgba(100, 150, 255, 0.1)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FolderGit2 size={18} color="#6b7280" />
          <p style={{ color: '#6b7280', fontSize: '13px' }}>
            {projectData?.name || 'No project loaded'}
          </p>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          onClick={() => setDropdownOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999
          }}
        />
      )}

      {/* Scan Summary */}
      {scanResults && (
        <div style={{
          padding: '14px',
          marginBottom: '16px',
          background: scanResults.totalIssues > 0 
            ? 'rgba(239, 68, 68, 0.1)' 
            : 'rgba(16, 185, 129, 0.1)',
          border: `1px solid ${scanResults.totalIssues > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          borderRadius: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            {scanResults.totalIssues > 0 ? (
              <AlertTriangle size={16} color="#ef4444" />
            ) : (
              <CheckCircle size={16} color="#10b981" />
            )}
            <span style={{ 
              color: scanResults.totalIssues > 0 ? '#ef4444' : '#10b981', 
              fontSize: '13px', 
              fontWeight: '600' 
            }}>
              {scanResults.totalIssues > 0 
                ? `${scanResults.totalIssues} Issues Found` 
                : 'No Issues Found'}
            </span>
          </div>
          {scanResults.totalIssues > 0 && (
            <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
              <span style={{ color: '#ef4444' }}>🔴 {scanResults.high || 0} High</span>
              <span style={{ color: '#f59e0b' }}>🟠 {scanResults.medium || 0} Med</span>
              <span style={{ color: '#6b7280' }}>⚪ {scanResults.low || 0} Low</span>
            </div>
          )}
        </div>
      )}

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
                  ? `rgba(${module.color === '#a855f7' ? '168, 85, 247' : '0, 212, 255'}, 0.1)` 
                  : 'transparent',
                border: isActive
                  ? `1px solid rgba(${module.color === '#a855f7' ? '168, 85, 247' : '0, 212, 255'}, 0.3)`
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {module.badge && (
                  <span style={{
                    padding: '2px 8px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    color: '#ef4444',
                    fontWeight: '600'
                  }}>
                    {module.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={18} />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        paddingTop: '16px',
        borderTop: '1px solid rgba(100, 150, 255, 0.1)',
        fontSize: '11px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        <p>SecOps AI Scanner v1.0</p>
        <p style={{ marginTop: '4px', opacity: 0.7 }}>Powered by SAST Engine</p>
      </div>
    </div>
  );
};

export default Sidebar;
