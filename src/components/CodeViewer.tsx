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

// ── Syntax Highlighting ───────────────────────────────────────────────────────

const JS_KEYWORDS = new Set([
  'import', 'export', 'default', 'const', 'let', 'var', 'function', 'class',
  'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
  'continue', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'super',
  'typeof', 'instanceof', 'null', 'undefined', 'true', 'false', 'async',
  'await', 'from', 'of', 'in', 'type', 'interface', 'extends', 'implements',
  'static', 'public', 'private', 'protected', 'readonly', 'void', 'string',
  'number', 'boolean', 'any', 'never', 'object', 'React', 'useState',
  'useEffect', 'useContext', 'useRef', 'require', 'module', 'exports', 'enum',
  'abstract', 'declare', 'namespace', 'keyof', 'typeof',
]);

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'CREATE', 'TABLE', 'INSERT', 'INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE', 'DROP', 'ALTER', 'ADD', 'INDEX', 'PRIMARY', 'KEY',
  'FOREIGN', 'REFERENCES', 'ON', 'CASCADE', 'NOT', 'NULL', 'DEFAULT', 'INT',
  'INTEGER', 'VARCHAR', 'TEXT', 'DECIMAL', 'TIMESTAMP', 'DATE', 'BOOLEAN',
  'UNIQUE', 'AUTO_INCREMENT', 'IF', 'EXISTS', 'JOIN', 'LEFT', 'RIGHT', 'INNER',
  'OUTER', 'AS', 'AND', 'OR', 'IN', 'LIKE', 'ORDER', 'BY', 'GROUP', 'HAVING',
  'LIMIT', 'OFFSET', 'CONSTRAINT', 'COLUMN', 'DATABASE', 'USE', 'SHOW',
]);

const JSON_KEYWORDS = new Set(['true', 'false', 'null']);

type TokType = 'keyword' | 'string' | 'comment' | 'number' | 'fn' | 'operator' | 'punct' | 'plain' | 'tag';

interface Tok { type: TokType; value: string }

function tokenizeLine(line: string, lang: string): Tok[] {
  const tokens: Tok[] = [];
  const keywords =
    lang === 'sql' ? SQL_KEYWORDS :
    lang === 'json' ? JSON_KEYWORDS :
    JS_KEYWORDS;

  let i = 0;
  while (i < line.length) {
    const ch = line[i];

    // Single-line comment
    if ((ch === '/' && line[i + 1] === '/') || (lang === 'sql' && ch === '-' && line[i + 1] === '-')) {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }

    // JSX/HTML tag (rough detection: <Word or </Word)
    if (ch === '<' && /[a-zA-Z\/]/.test(line[i + 1] ?? '')) {
      let j = i + 1;
      while (j < line.length && line[j] !== '>' && line[j] !== ' ') j++;
      if (j < line.length) j++;
      tokens.push({ type: 'tag', value: line.slice(i, j) });
      i = j;
      continue;
    }

    // String literals — handle multi-char quote sequences
    if (ch === '"' || ch === "'" || ch === '`') {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === '\\') { j += 2; continue; }
        if (line[j] === ch) { j++; break; }
        j++;
      }
      tokens.push({ type: 'string', value: line.slice(i, j) });
      i = j;
      continue;
    }

    // Numbers
    if (/\d/.test(ch)) {
      let j = i;
      while (j < line.length && /[\d.xXa-fA-F]/.test(line[j])) j++;
      tokens.push({ type: 'number', value: line.slice(i, j) });
      i = j;
      continue;
    }

    // Words: keyword, function call, or identifier
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (keywords.has(word) || keywords.has(word.toUpperCase())) {
        tokens.push({ type: 'keyword', value: word });
      } else if (j < line.length && line[j] === '(') {
        tokens.push({ type: 'fn', value: word });
      } else {
        tokens.push({ type: 'plain', value: word });
      }
      i = j;
      continue;
    }

    // Operators
    if (/[=<>!+\-*/%&|^~?]/.test(ch)) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    // Punctuation / whitespace — pass through as plain
    tokens.push({ type: 'plain', value: ch });
    i++;
  }

  return tokens;
}

const TOKEN_COLORS: Record<TokType, string> = {
  keyword:  '#569cd6',  // VS Code blue
  string:   '#ce9178',  // VS Code orange-brown
  comment:  '#6a9955',  // VS Code green
  number:   '#b5cea8',  // VS Code light green
  fn:       '#dcdcaa',  // VS Code yellow
  operator: '#d4d4d4',
  punct:    '#d4d4d4',
  plain:    '#d4d4d4',
  tag:      '#4ec9b0',  // teal for JSX tags
};

function renderHighlightedCode(content: string, language: string): React.ReactNode {
  const lines = content.split('\n');
  return lines.map((line, lineIdx) => (
    <div key={lineIdx} style={{ minHeight: '1.6em' }}>
      {tokenizeLine(line, language).map((tok, tokIdx) => (
        <span key={tokIdx} style={{ color: TOKEN_COLORS[tok.type] }}>
          {tok.value}
        </span>
      ))}
    </div>
  ));
}

// ── Component ────────────────────────────────────────────────────────────────

export const CodeViewer: React.FC<CodeViewerProps> = ({ template }) => {
  const [activeFileIdx, setActiveFileIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'frontend': true,
    'backend': true,
    'database': true,
    'frontend/src': true,
  });

  const files = template.files;
  const currentFile: GeneratedFile | null = files[activeFileIdx] ?? files[0] ?? null;

  const handleCopy = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleFolder = (path: string) => {
    setOpenFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Build hierarchical directory tree dynamically
  const buildFileTree = (): TreeItem[] => {
    const root: TreeItem[] = [];

    const getOrCreateFolder = (
      folders: string[],
      currentLevelList: TreeItem[],
      parentPath: string,
    ): TreeItem[] => {
      let currentPath = parentPath;
      let currentList = currentLevelList;
      for (let idx = 0; idx < folders.length; idx++) {
        const folderName = folders[idx];
        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
        let existing = currentList.find(item => item.isFolder && item.name === folderName);
        if (!existing) {
          existing = { name: folderName, path: currentPath, isFolder: true, level: idx + 1, children: [] };
          currentList.push(existing);
        }
        currentList = existing.children!;
      }
      return currentList;
    };

    files.forEach((file, index) => {
      const parts = file.path.split('/');
      const fileName = parts.pop() ?? '';
      const folderList = getOrCreateFolder(parts, root, '');
      folderList.push({
        name: fileName,
        path: file.path,
        isFolder: false,
        level: parts.length + 1,
        fileIndex: index,
      });
    });

    return root;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'json') return <FileJson size={14} style={{ color: '#f59e0b' }} />;
    if (ext === 'sql')  return <Database  size={14} style={{ color: '#10b981' }} />;
    if (ext === 'md')   return <FileText  size={14} style={{ color: '#38bdf8' }} />;
    return <FileCode size={14} style={{ color: '#6366f1' }} />;
  };

  const renderTreeItem = (item: TreeItem): React.ReactNode => {
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
          {isOpen && item.children?.map(child => renderTreeItem(child))}
        </div>
      );
    }

    const isActive = item.fileIndex === activeFileIdx;
    return (
      <div
        key={item.path}
        className={`tree-node ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
        onClick={() => { if (item.fileIndex !== undefined) setActiveFileIdx(item.fileIndex); }}
      >
        <span style={{ width: '14px' }} />
        {getFileIcon(item.name)}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{item.name}</span>
      </div>
    );
  };

  const tree = buildFileTree();

  // Detect language for highlighting
  const detectLang = (file: GeneratedFile): string => {
    if (file.language) return file.language;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'sql') return 'sql';
    if (ext === 'json') return 'json';
    if (ext === 'md') return 'markdown';
    return 'javascript';
  };

  return (
    <div className="code-viewer-grid">
      {/* File Tree */}
      <div className="file-tree">
        <h3 className="file-tree-title">Explorateur</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {tree.map(item => renderTreeItem(item))}
        </div>
      </div>

      {/* Editor Pane */}
      <div className="editor-pane">
        {currentFile ? (
          <>
            <div className="editor-header">
              <span className="editor-filename">{currentFile.path}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, background: 'var(--bg-tertiary)',
                  color: 'var(--text-muted)', padding: '0.15rem 0.5rem', borderRadius: '4px',
                  textTransform: 'uppercase', border: '1px solid var(--border-color)',
                }}>
                  {detectLang(currentFile)}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {currentFile.content.split('\n').length} lignes
                </span>
                <button className="btn btn-secondary" onClick={handleCopy} style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                  {copied
                    ? <span className="flex-center" style={{ gap: '0.3rem' }}><Check size={14} style={{ color: 'var(--success)' }} /> Copié!</span>
                    : <span className="flex-center" style={{ gap: '0.3rem' }}><Copy size={14} /> Copier</span>
                  }
                </button>
              </div>
            </div>
            <div className="editor-body">
              <div className="code-container">
                <div className="line-numbers">
                  {currentFile.content.split('\n').map((_, idx) => (
                    <div key={idx}>{idx + 1}</div>
                  ))}
                </div>
                <div className="code-content">
                  {renderHighlightedCode(currentFile.content, detectLang(currentFile))}
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
