# SecOps SAST Scanner

A **Static Application Security Testing (SAST)** tool that scans GitHub repositories for security vulnerabilities, secrets, and insecure code patterns.

## 🔐 Features

### GitHub Integration
- GitHub OAuth authentication via Supabase
- Browse and import any accessible GitHub repository
- Real-time repository file tree exploration

### 🛡️ SAST Security Scanner
- **20+ Security Rules** detecting:
  - 🔑 **Secrets & API Keys**: OpenAI keys (sk-), GitHub tokens (ghp_, gho_), AWS keys (AKIA)
  - 🔐 **Credentials**: Hardcoded passwords, database connection strings
  - 👤 **PII Detection**: Email addresses, phone numbers, SSN patterns
  - ⚠️ **Insecure Patterns**: debug=true, 0.0.0.0 binding, eval(), dangerouslySetInnerHTML

### 📊 Security Dashboard
- Risk level indicators (Critical, High, Medium, Low)
- File-level vulnerability counts
- Interactive file tree with security badges
- Annotated code viewer with line-level highlighting

### 🎯 Code Annotation
- Hover tooltips with vulnerability details
- Security recommendations for each issue
- Color-coded severity levels

## 🛠️ Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | React 18 | UI Framework |
| **Build Tool** | Vite 5 | Dev server & bundling |
| **Backend (BaaS)** | Supabase | Authentication & PostgreSQL |
| **Auth** | GitHub OAuth | User authentication |
| **API** | GitHub REST API | Repository access |
| **Charts** | Recharts | Data visualization |
| **Icons** | Lucide React | Icon library |
| **Deployment** | Vercel | Hosting platform |

## 📁 Project Structure

```
src/
├── components/
│   ├── GitHubModal.jsx      # GitHub OAuth & repo import
│   ├── Sidebar.jsx          # Navigation with project switcher
│   ├── Dashboard.jsx        # Overview dashboard
│   ├── SecOps.jsx           # SAST security scanner (main feature)
│   └── FileTreeExplorer.jsx # Reusable file tree component
├── context/
│   └── FileContext.jsx      # Shared file state
├── lib/
│   ├── supabase.js          # Supabase client & auth
│   └── githubAPI.js         # GitHub API helpers
├── data/
│   └── mockData.js          # Demo data
├── App.jsx                  # Main app with routing
├── main.jsx                 # Entry point
└── index.css                # Global styles
```

## 🚀 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## ⚙️ Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 Setup

1. **Supabase Setup**:
   - Create a Supabase project
   - Enable GitHub OAuth in Authentication → Providers
   - Configure redirect URLs

2. **GitHub OAuth**:
   - Create a GitHub OAuth App
   - Set callback URL to Supabase auth callback
   - Add Client ID/Secret to Supabase

3. **Deploy to Vercel**:
   - Connect GitHub repo
   - Add environment variables
   - Update Supabase redirect URLs

## 📖 Usage

1. **Login**: Click "Connect GitHub" to authenticate
2. **Import Repo**: Select a repository to scan
3. **Scan**: Navigate to SecOps to view security analysis
4. **Review**: Click on files to see annotated vulnerabilities
5. **Fix**: Follow recommendations to resolve issues

## 🎨 Design

- **Dark Theme**: Deep blues with cyber-security aesthetic
- **Glassmorphism**: Translucent panels with backdrop blur
- **Neon Accents**: Cyan (#00d4ff), Purple (#a855f7), Red (#ff4444)

## 📜 License

MIT
