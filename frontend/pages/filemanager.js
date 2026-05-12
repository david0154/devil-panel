import { useState, useRef } from 'react';
import Layout from '../components/Layout';

const MOCK_FILES = [
  { name: 'public_html', type: 'dir',  size: '-',       modified: '2026-05-10 12:00', perms: 'drwxr-xr-x' },
  { name: 'wp-config.php', type: 'file', size: '3.2 KB', modified: '2026-05-09 08:30', perms: '-rw-r--r--' },
  { name: 'wp-content',  type: 'dir',  size: '-',       modified: '2026-05-08 15:45', perms: 'drwxr-xr-x' },
  { name: '.htaccess',   type: 'file', size: '412 B',   modified: '2026-05-07 11:20', perms: '-rw-r--r--' },
  { name: 'backup.zip',  type: 'file', size: '145 MB',  modified: '2026-05-06 03:00', perms: '-rw-r--r--' },
  { name: 'logs',        type: 'dir',  size: '-',       modified: '2026-05-05 18:00', perms: 'drwx------' },
];

export default function FileManager() {
  const [path, setPath] = useState('/home/user/public_html');
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [editorFile, setEditorFile] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [termLines, setTermLines] = useState(['$ Welcome to Devil Panel Terminal', '$ Type commands below...']);
  const [termInput, setTermInput] = useState('');
  const termRef = useRef(null);

  const files = MOCK_FILES.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (name) => {
    setSelected(s => s.includes(name) ? s.filter(x => x !== name) : [...s, name]);
  };

  const openEditor = (f) => {
    if (f.type === 'file') {
      setEditorFile(f.name);
      setEditorContent(`<?php\n// ${f.name}\n// Devil Panel File Editor\n`);
    }
  };

  const handleTermCmd = (e) => {
    if (e.key === 'Enter' && termInput.trim()) {
      const cmd = termInput.trim();
      setTermLines(l => [...l, `$ ${cmd}`, `bash: ${cmd}: simulated response`]);
      setTermInput('');
      setTimeout(() => {
        if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
      }, 50);
    }
  };

  return (
    <Layout title="File Manager">
      <div className="page-header">
        <div className="page-title">
          <h1>📁 File Manager</h1>
          <p>Browse, edit and manage your files</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-md" onClick={() => setShowTerminal(t => !t)}>
            💻 Terminal
          </button>
          <button className="btn btn-primary btn-md">➕ Upload File</button>
        </div>
      </div>

      {/* Path bar */}
      <div className="card" style={{ marginBottom: 16, padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--text-muted, #555577)', fontSize: 13 }}>Path:</span>
          <div style={{
            flex: 1, background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8, padding: '6px 12px', fontFamily: 'monospace',
            fontSize: 13, color: '#ff2d2d'
          }}>
            {path}
          </div>
          <button className="btn btn-ghost btn-sm">🔄 Refresh</button>
          <button className="btn btn-ghost btn-sm">📂 New Folder</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: editorFile ? '1fr 1fr' : '1fr', gap: 16 }}>
        {/* File list */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header" style={{ padding: '16px 20px' }}>
            <span className="card-title">📂 Files</span>
            <div className="search-input" style={{ width: 200 }}>
              <span className="search-icon">🔍</span>
              <input
                type="text" placeholder="Search files..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="dp-table-wrap">
            <table className="dp-table">
              <thead>
                <tr>
                  <th style={{ width: 32 }}></th>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Permissions</th>
                  <th>Modified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map(f => (
                  <tr key={f.name}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(f.name)}
                        onChange={() => toggleSelect(f.name)}
                      />
                    </td>
                    <td style={{ cursor: 'pointer' }} onDoubleClick={() => openEditor(f)}>
                      <span style={{ marginRight: 8 }}>{f.type === 'dir' ? '📁' : '📄'}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{f.name}</span>
                    </td>
                    <td style={{ color: '#9999b8', fontFamily: 'monospace', fontSize: 12 }}>{f.size}</td>
                    <td><code style={{ fontSize: 11, color: '#555577' }}>{f.perms}</code></td>
                    <td style={{ color: '#9999b8', fontSize: 12 }}>{f.modified}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-icon" title="Edit" onClick={() => openEditor(f)}>✏️</button>
                        <button className="btn btn-icon" title="Download">⬇️</button>
                        <button className="btn btn-icon" title="Delete" style={{ color: '#ff2d2d' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selected.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#9999b8' }}>{selected.length} selected</span>
              <button className="btn btn-danger btn-sm">🗑️ Delete</button>
              <button className="btn btn-ghost btn-sm">📦 Compress</button>
              <button className="btn btn-ghost btn-sm">📁 Move</button>
            </div>
          )}
        </div>

        {/* Editor */}
        {editorFile && (
          <div className="card" style={{ padding: 0 }}>
            <div className="card-header" style={{ padding: '16px 20px' }}>
              <span className="card-title">✏️ {editorFile}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm">💾 Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditorFile(null)}>✕</button>
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <textarea
                value={editorContent}
                onChange={e => setEditorContent(e.target.value)}
                style={{
                  width: '100%', minHeight: 400, background: '#050508',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8,
                  color: '#00ff41', fontFamily: 'monospace', fontSize: 13,
                  padding: 16, resize: 'vertical', outline: 'none', lineHeight: 1.6
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Terminal */}
      {showTerminal && (
        <div className="card" style={{ marginTop: 16, padding: 0 }}>
          <div className="card-header" style={{ padding: '12px 20px' }}>
            <span className="card-title">💻 Web Terminal</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowTerminal(false)}>✕ Close</button>
          </div>
          <div
            ref={termRef}
            className="terminal"
            style={{ margin: 16, marginTop: 0 }}
          >
            {termLines.map((l, i) => (
              <p key={i} className={`term-line${l.startsWith('bash:') ? ' error' : ''}`}>{l}</p>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#ff2d2d' }}>$</span>
              <input
                type="text"
                value={termInput}
                onChange={e => setTermInput(e.target.value)}
                onKeyDown={handleTermCmd}
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  color: '#00ff41', fontFamily: 'monospace', fontSize: 13,
                  outline: 'none'
                }}
                placeholder="Type command..."
                autoFocus
              />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
