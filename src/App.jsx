import React, { useState } from 'react';
import GitHubModal from './components/GitHubModal';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SecOps from './components/SecOps';

// Initial clean state for project capabilities
const initialCapabilities = {
  isScanned: false,
  isLLM: false,
  isAgent: false,
  isRAG: false,
  isAIProject: false,
  detectedLibraries: [],
  detectedFrameworks: [],
  techStack: [],
  scanConfidence: 0
};

function App() {
  const [showGitHubModal, setShowGitHubModal] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [projectData, setProjectData] = useState(null);
  const [capabilities, setCapabilities] = useState(initialCapabilities);
  const [repositories, setRepositories] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // Clean Slate Protocol - Reset all states when selecting new repo
  const resetProjectState = () => {
    setProjectData(null);
    setCapabilities(initialCapabilities);
    setActiveModule('dashboard');
    localStorage.removeItem('nexus_project');
    localStorage.removeItem('nexus_capabilities');
  };

  const handleGitHubComplete = (repoData, reposList = []) => {
    console.log('✅ Repository connected:', repoData);
    
    // Analyze capabilities from scan results
    const newCapabilities = analyzeCapabilities(repoData);
    
    setProjectData(repoData);
    setCapabilities(newCapabilities);
    if (reposList.length > 0) {
      setRepositories(reposList);
    }
    setShowGitHubModal(false);
    
    // Store in localStorage for persistence
    localStorage.setItem('nexus_project', JSON.stringify(repoData));
    localStorage.setItem('nexus_capabilities', JSON.stringify(newCapabilities));
  };

  // Handle project switch from sidebar
  const handleProjectSwitch = async (repoFullName) => {
    if (isScanning) return;
    
    const targetRepo = repositories.find(r => r.full_name === repoFullName);
    if (!targetRepo || targetRepo.full_name === projectData?.fullName) return;
    
    // Reset state before scanning
    setIsScanning(true);
    setCapabilities(initialCapabilities);
    setActiveModule('dashboard');
    
    // Trigger re-open of GitHub modal with pre-selected repo
    setProjectData({ ...projectData, _pendingSwitch: targetRepo });
    setShowGitHubModal(true);
    setIsScanning(false);
  };

  // Analyze repo data to determine project capabilities
  const analyzeCapabilities = (repoData) => {
    const libraries = (repoData.dependencies || []).map(d => d.toLowerCase());
    const frameworks = (repoData.detectedFrameworks || []).map(f => f.toLowerCase());
    const allDeps = [...libraries, ...frameworks].join(' ');

    // RAG Detection: Vector databases
    const ragKeywords = ['pinecone', 'chromadb', 'chroma', 'weaviate', 'faiss', 'qdrant', 'milvus', 'pgvector'];
    const isRAG = ragKeywords.some(kw => allDeps.includes(kw));

    // Agent Detection: Agent frameworks
    const agentKeywords = ['langchain', 'autogen', 'crewai', 'llama-index', 'llamaindex', 'semantic-kernel', 'autogpt', 'babyagi'];
    const isAgent = agentKeywords.some(kw => allDeps.includes(kw));

    // LLM Detection: LLM providers
    const llmKeywords = ['openai', 'anthropic', 'cohere', 'replicate', 'huggingface', 'transformers', 'ollama', 'litellm'];
    const isLLM = llmKeywords.some(kw => allDeps.includes(kw));

    const isAIProject = isLLM || isAgent || isRAG || (repoData.isAIProject === true);

    return {
      isScanned: true,
      isLLM,
      isAgent,
      isRAG,
      isAIProject,
      detectedLibraries: repoData.dependencies || [],
      detectedFrameworks: repoData.detectedFrameworks || [],
      techStack: repoData.techStack || [],
      scanConfidence: repoData.scanConfidence || 0
    };
  };

  // Handle module change - now simplified for SecOps focus
  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard projectData={projectData} capabilities={capabilities} />;
      case 'secops':
        return <SecOps projectData={projectData} />;
      default:
        return <Dashboard projectData={projectData} capabilities={capabilities} />;
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
          onClose={() => {
            setShowGitHubModal(false);
            // Clear pending switch if user closes modal
            if (projectData?._pendingSwitch) {
              setProjectData({ ...projectData, _pendingSwitch: null });
            }
          }} 
          onComplete={handleGitHubComplete}
          pendingRepo={projectData?._pendingSwitch || null}
          existingRepos={repositories}
        />
      )}

      {/* Main Application */}
      {!showGitHubModal && (
        <div style={{ display: 'flex', position: 'relative', zIndex: 1 }}>
          <Sidebar 
            activeModule={activeModule} 
            onModuleChange={handleModuleChange}
            capabilities={capabilities}
            projectData={projectData}
            repositories={repositories}
            onProjectSwitch={handleProjectSwitch}
            isScanning={isScanning}
          />
          
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
