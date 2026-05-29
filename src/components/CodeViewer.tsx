import React, { useState } from 'react';
import type { AppTemplate, GeneratedFile } from '../utils/templates';
import { Folder, FileCode, Copy, Check, ChevronRight, ChevronDown, FileJson, FileText, Database } from 'lucide-react';

interface CodeViewerProps {
  template: AppTemplate;
}

interface TreeItem {
  name: string;
  path: string;
  isFolder: boolean;
  level: number;
  isOpen?: boolean;
  children?: TreeItem[];
  fileIndex?: number;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ template }) => {
  const [activeFileIdx, setActiveFileIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'frontend': true,
    'backend': true,
    'database': true,
    'frontend/src': true
  });

  const files = template.files;
  const currentFile = files[activeFileIdx] || files[0] || null;

  const handleCopy = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleFolder = (path: string) => {
    setOpenFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Build the hierarchical directory tree dynamically
  const buildFileTree = (): TreeItem[] => {
    const root: TreeItem[] = [];

    // Helper to find or create folders in tree
    const getOrCreateFolder = (folders: string[], currentLevelList: TreeItem[], parentPath: string): TreeItem[] => {
      let currentPath = parentPath;
      let currentList = currentLevelList;

      for (let i = 0; i < folders.length; i++) {
        const folderName = folders[i];
        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

        let existing = currentList.find(item => item.isFolder && item.name === folderName);
        if (!existing) {
          existing = {
            name: folderName,
            path: currentPath,
            isFolder: true,
            level: i + 1,
            children: []
          };
          currentList.push(existing);
        }
        currentList = existing.children || [];
      }
      return currentList;
    };

    // Add each file to tree
    files.forEach((file, index) => {
      const parts = file.path.split('/');
      const fileName = parts.pop() || '';
      const folders = parts;

      const folderList = getOrCreateFolder(folders, root, '');
      folderList.push({
        name: fileName,
        path: file.path,
        isFolder: false,
        level: folders.length + 1,
        fileIndex: index
      });
    });

    return root;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'json') return <FileJson size={14} style={{ color: '#f59e0b' }} />;
    if (ext === 'sql') return <Database size={14} style={{ color: '#10b981' }} />;
    if (ext === 'md') return <FileText size={14} style={{ color: '#38bdf8' }} />;
    return <FileCode size={14} style={{ color: '#6366f1' }} />;
  };

  const renderTreeItem = (item: TreeItem) => {
    if (item.isFolder) {
      const isOpen = !!openFolders[item.path];
      return (
        <div key={item.path} style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            className="tree-node"
            style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
            onClick={() => toggleFolder(item.path)}
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Folder size={14} style={{ color: '#a855f7', opacity: 0.8 }} />
            <span style={{ fontWeight: 600 }}>{item.name}</span>
          </div>
          {isOpen && item.children && item.children.map(child => renderTreeItem(child))}
        </div>
      );
    } else {
      const isActive = item.fileIndex === activeFileIdx;
      return (
        <div
          key={item.path}
          className={`tree-node ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
          onClick={() => {
            if (item.fileIndex !== undefined) {
              setActiveFileIdx(item.fileIndex);
            }
          }}
        >
          <span style={{ width: '14px' }}></span> {/* Spacer in place of expand chevron */}
          {getFileIcon(item.name)}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{item.name}</span>
        </div>
      );
    }
  };

  const tree = buildFileTree();

  return (
    <div className="code-viewer-grid">
      <div className="file-tree">
        <h3 className="file-tree-title">Explorateur</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {tree.map(item => renderTreeItem(item))}
        </div>
      </div>

      <div className="editor-pane">
        {currentFile ? (
          <>
            <div className="editor-header">
              <span className="editor-filename">{currentFile.path}</span>
              <button className="btn btn-secondary" onClick={handleCopy} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                {copied ? (
                  <span className="flex-center" style={{ gap: '0.3rem' }}><Check size={14} style={{ color: 'var(--success)' }} /> Copié!</span>
                ) : (
                  <span className="flex-center" style={{ gap: '0.3rem' }}><Copy size={14} /> Copier</span>
                )}
              </button>
            </div>
            <div className="editor-body">
              <div className="code-container">
                <div className="line-numbers">
                  {currentFile.content.split('\n').map((_, index) => (
                    <div key={index}>{index + 1}</div>
                  ))}
                </div>
                <div className="code-content">
                  {currentFile.content}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-center" style={{ height: '100%', color: 'var(--text-secondary)' }}>
            Aucun fichier généré.
          </div>
        )}
      </div>
    </div>
  );
};
