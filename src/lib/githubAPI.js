import axios from 'axios';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * GitHub API Client
 * Uses the GitHub OAuth token from Supabase Auth
 */
class GitHubAPI {
  constructor(token) {
    this.token = token;
    this.client = axios.create({
      baseURL: GITHUB_API_BASE,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
  }

  /**
   * Get authenticated user's repositories
   */
  async getUserRepositories() {
    try {
      const response = await this.client.get('/user/repos', {
        params: {
          sort: 'updated',
          per_page: 100,
          affiliation: 'owner,collaborator'
        }
      });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get repository details
   */
  async getRepository(owner, repo) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get repository contents
   */
  async getRepositoryContents(owner, repo, path = '') {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/contents/${path}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Get file content (decode base64)
   */
  async getFileContent(owner, repo, path) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/contents/${path}`);
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return { data: content, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Search for Python/LangChain files in repository
   */
  async scanRepository(owner, repo) {
    try {
      const results = {
        pythonFiles: [],
        requirements: null,
        hasLangChain: false,
        hasFastAPI: false,
        hasStreamlit: false,
        dependencies: []
      };

      // Get repository tree
      const { data: repoData } = await this.getRepository(owner, repo);
      const defaultBranch = repoData.default_branch || 'main';

      const treeResponse = await this.client.get(
        `/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`
      );

      const tree = treeResponse.data.tree;

      // Filter Python files
      results.pythonFiles = tree
        .filter(item => item.path.endsWith('.py'))
        .map(item => item.path);

      // Check for requirements.txt
      const requirementsFile = tree.find(item => item.path === 'requirements.txt');
      if (requirementsFile) {
        const { data: reqContent } = await this.getFileContent(owner, repo, 'requirements.txt');
        results.requirements = reqContent;
        
        // Parse dependencies
        results.dependencies = reqContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'))
          .map(line => line.split('==')[0].split('>=')[0].split('<=')[0].trim());

        // Check for frameworks
        results.hasLangChain = results.dependencies.some(dep => 
          dep.toLowerCase().includes('langchain')
        );
        results.hasFastAPI = results.dependencies.some(dep => 
          dep.toLowerCase().includes('fastapi')
        );
        results.hasStreamlit = results.dependencies.some(dep => 
          dep.toLowerCase().includes('streamlit')
        );
      }

      // Check for package.json (JS/TS projects)
      const packageJson = tree.find(item => item.path === 'package.json');
      if (packageJson) {
        const { data: pkgContent } = await this.getFileContent(owner, repo, 'package.json');
        try {
          const pkg = JSON.parse(pkgContent);
          const allDeps = {
            ...pkg.dependencies,
            ...pkg.devDependencies
          };
          results.dependencies.push(...Object.keys(allDeps));
        } catch (e) {
          console.error('Failed to parse package.json', e);
        }
      }

      return { data: results, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  /**
   * Analyze repository for AI/ML patterns
   */
  async analyzeRepository(owner, repo) {
    try {
      const { data: scanResults } = await this.scanRepository(owner, repo);
      
      const analysis = {
        framework: 'Unknown',
        language: 'Unknown',
        aiPatterns: [],
        healthScore: 0,
        recommendations: []
      };

      // Determine primary language
      if (scanResults.pythonFiles.length > 0) {
        analysis.language = 'Python';
      }

      // Determine framework
      if (scanResults.hasLangChain) {
        analysis.framework = 'LangChain';
        analysis.aiPatterns.push('LangChain Agent');
      }
      if (scanResults.hasFastAPI) {
        analysis.aiPatterns.push('FastAPI Backend');
      }
      if (scanResults.hasStreamlit) {
        analysis.aiPatterns.push('Streamlit UI');
      }

      // Check for common AI patterns
      const aiKeywords = ['openai', 'anthropic', 'chromadb', 'pinecone', 'llamaindex'];
      scanResults.dependencies.forEach(dep => {
        const depLower = dep.toLowerCase();
        aiKeywords.forEach(keyword => {
          if (depLower.includes(keyword)) {
            analysis.aiPatterns.push(keyword);
          }
        });
      });

      // Calculate health score (simplified)
      let score = 50; // Base score
      if (scanResults.requirements) score += 10;
      if (scanResults.hasLangChain) score += 15;
      if (scanResults.pythonFiles.length > 5) score += 10;
      if (analysis.aiPatterns.length > 2) score += 15;
      
      analysis.healthScore = Math.min(score, 100);

      // Generate recommendations
      if (!scanResults.requirements) {
        analysis.recommendations.push('Add requirements.txt for dependency management');
      }
      if (!scanResults.hasLangChain && scanResults.pythonFiles.length > 0) {
        analysis.recommendations.push('Consider using LangChain for agent orchestration');
      }

      return { data: analysis, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
}

export default GitHubAPI;
