import React, { createContext, useContext, useState, useCallback } from 'react';

const FileContext = createContext(null);

export const FileProvider = ({ children, accessToken, repoFullName }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileContent, setSelectedFileContent] = useState(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [fileTree, setFileTree] = useState([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [error, setError] = useState(null);

  // Fetch repository file tree
  const fetchFileTree = useCallback(async (owner, repo, branch = 'main') => {
    if (!accessToken) {
      setError('No access token available');
      return;
    }

    setIsLoadingTree(true);
    setError(null);

    try {
      // Try main branch first, then master
      let response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok && branch === 'main') {
        // Try master branch
        response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch file tree: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform flat tree to nested structure
      const nestedTree = buildNestedTree(data.tree || []);
      setFileTree(nestedTree);
      
    } catch (err) {
      console.error('Error fetching file tree:', err);
      setError(err.message);
    } finally {
      setIsLoadingTree(false);
    }
  }, [accessToken]);

  // Build nested tree structure from flat GitHub API response
  const buildNestedTree = (flatTree) => {
    const root = { children: {} };

    // Filter and sort - folders first, then files
    const sortedItems = flatTree
      .filter(item => item.type === 'blob' || item.type === 'tree')
      .sort((a, b) => {
        // Folders before files
        if (a.type === 'tree' && b.type !== 'tree') return -1;
        if (a.type !== 'tree' && b.type === 'tree') return 1;
        // Alphabetical
        return a.path.localeCompare(b.path);
      });

    for (const item of sortedItems) {
      const parts = item.path.split('/');
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLastPart = i === parts.length - 1;

        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: parts.slice(0, i + 1).join('/'),
            type: isLastPart ? item.type : 'tree',
            sha: isLastPart ? item.sha : null,
            size: item.size,
            children: {}
          };
        }

        current = current.children[part];
      }
    }

    // Convert to array format
    const convertToArray = (node) => {
      const children = Object.values(node.children);
      return children.map(child => ({
        ...child,
        children: child.type === 'tree' ? convertToArray(child) : undefined
      })).sort((a, b) => {
        // Folders first
        if (a.type === 'tree' && b.type !== 'tree') return -1;
        if (a.type !== 'tree' && b.type === 'tree') return 1;
        return a.name.localeCompare(b.name);
      });
    };

    return convertToArray(root);
  };

  // Fetch file content
  const fetchFileContent = useCallback(async (path) => {
    if (!accessToken || !repoFullName) {
      setError('Missing access token or repository');
      return null;
    }

    setIsLoadingContent(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoFullName}/contents/${path}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      const data = await response.json();
      
      // Decode base64 content
      let content = '';
      if (data.content) {
        try {
          content = atob(data.content.replace(/\n/g, ''));
        } catch {
          content = '[Binary file - cannot display]';
        }
      }

      const fileData = {
        name: data.name,
        path: data.path,
        content,
        size: data.size,
        sha: data.sha,
        encoding: data.encoding,
        url: data.html_url
      };

      setSelectedFile(fileData);
      setSelectedFileContent(content);
      
      return fileData;

    } catch (err) {
      console.error('Error fetching file content:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoadingContent(false);
    }
  }, [accessToken, repoFullName]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setSelectedFileContent(null);
  }, []);

  const value = {
    // State
    fileTree,
    selectedFile,
    selectedFileContent,
    isLoadingTree,
    isLoadingContent,
    error,
    
    // Actions
    fetchFileTree,
    fetchFileContent,
    clearSelection,
    setError
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};

export default FileContext;
