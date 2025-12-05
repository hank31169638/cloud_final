import React, { useState } from 'react';
import GitHubModal from './components/GitHubModal';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LLMOps from './components/LLMOps';
import AgentOps from './components/AgentOps';
import SecOps from './components/SecOps';
import DataOps from './components/DataOps';
import DevOps from './components/DevOps';

function App() {
  const [showGitHubModal, setShowGitHubModal] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [projectData, setProjectData] = useState(null);

  const handleGitHubComplete = (repoData) => {
    console.log('✅ Repository connected:', repoData);
    setProjectData(repoData);
    setShowGitHubModal(false);
    
    // Store in localStorage for persistence
    localStorage.setItem('nexus_project', JSON.stringify(repoData));
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'llmops':
        return <LLMOps />;
      case 'agentops':
        return <AgentOps />;
      case 'secops':
        return <SecOps />;
      case 'dataops':
        return <DataOps />;
      case 'devops':
        return <DevOps />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f3a 50%, #0a0e1a 100%)',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Grid Pattern Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(100, 150, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(100, 150, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        pointerEvents: 'none'
      }} />

      {/* GitHub Modal */}
      {showGitHubModal && (
        <GitHubModal 
          onClose={() => setShowGitHubModal(false)} 
          onComplete={handleGitHubComplete} 
        />
      )}

      {/* Main Application */}
      {!showGitHubModal && (
        <div style={{ display: 'flex', position: 'relative', zIndex: 1 }}>
          <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
          
          <main style={{
            marginLeft: '260px',
            width: 'calc(100% - 260px)',
            minHeight: '100vh',
            overflowY: 'auto'
          }}>
            <div className="animate-slide-in">
              {renderContent()}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
