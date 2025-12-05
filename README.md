# Nexus AI - X-Ops Mapping Platform

A comprehensive web application for managing AI Infrastructure with a focus on LLMOps, AgentOps, AI SecOps, DataOps, and DevOps.

## Features

### 🔐 GitHub Integration
- Landing page with GitHub repository connection
- Simulated repository cloning and analysis
- Project health score calculation

### 📊 Dashboard
- Overall health score visualization
- Real-time metrics for security, performance, reliability, and cost
- Token usage and cost analytics charts

### 🧠 LLMOps
- **Prompt Registry**: Side-by-side diff viewer for prompt versions
- **Model Router**: Configure primary and fallback models (GPT-4o → Claude 3.5)
- **Cost Analytics**: Track token usage, costs, and API requests

### 🕵️ AgentOps
- **Trace Observability**: Waterfall chart showing agent execution flow
  - User Input → Agent Thought → Tool Call → Final Answer
- **Tool Registry**: Manage and monitor active/disabled tools

### 🛡️ AI SecOps
- **Guardrails**: Configure security thresholds
  - Toxicity filter
  - PII masking
  - Prompt injection detection
  - Jailbreak prevention
- **Security Logs**: View blocked threats and security events

### 📚 DataOps
- **Knowledge Base**: File upload simulation and document management
- **Retrieval Eval**: RAG performance metrics
  - Hit rate radial chart
  - Precision, recall, MRR metrics
  - Query performance analysis

### ⚙️ DevOps (CI/CD)
- **Pipeline Status**: Visual CI/CD flow
  - Code Commit → Static Analysis → Prompt Testing → Deploy
- **Validation Report**: Pass/Fail tests for agent logic
  - Infinite loop prevention
  - Token limits
  - Security checks

## Design System

- **Dark Mode**: Deep blues (#0a0e1a) with cyber-security aesthetic
- **Neon Accents**: Cyan (#00d4ff), Purple (#a855f7), Red (#ff4444)
- **Glassmorphism**: Translucent panels with backdrop blur
- **Data Visualization**: Recharts library for professional charts

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Technology Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Recharts**: Data visualization library
- **Lucide React**: Icon library

## Project Structure

```
src/
├── components/
│   ├── GitHubModal.jsx      # Landing page with GitHub integration
│   ├── Sidebar.jsx          # Navigation sidebar
│   ├── Dashboard.jsx        # Main dashboard view
│   ├── LLMOps.jsx          # LLM operations module
│   ├── AgentOps.jsx        # Agent operations module
│   ├── SecOps.jsx          # Security operations module
│   ├── DataOps.jsx         # Data operations module
│   └── DevOps.jsx          # DevOps CI/CD module
├── data/
│   └── mockData.js         # Realistic mock data
├── App.jsx                 # Main application component
├── main.jsx               # React entry point
└── index.css              # Global styles

```

## Mock Data

The application uses comprehensive mock data to simulate a real AI infrastructure platform:
- 7 days of cost analytics
- Agent execution traces with waterfall timing
- Security logs with various threat types
- Knowledge base documents
- CI/CD pipeline stages
- Validation test results

## Usage

1. **Start**: Enter a GitHub repository URL (e.g., `github.com/user/agent-bot`)
2. **Loading**: Watch the simulated scanning process
3. **Dashboard**: View overall health score and metrics
4. **Navigate**: Use sidebar to explore different X-Ops modules
5. **Interact**: Configure settings, view charts, and analyze data

## Key Features Demonstrated

- ✅ Responsive glassmorphism UI
- ✅ Real-time data visualization
- ✅ Interactive controls (sliders, toggles, dropdowns)
- ✅ Waterfall chart for agent traces
- ✅ Radial charts for metrics
- ✅ Professional table layouts
- ✅ Cyber-security aesthetic
- ✅ Dense data presentation
- ✅ Smooth animations and transitions

## Browser Support

Modern browsers with ES6+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
