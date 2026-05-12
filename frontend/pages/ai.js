import { useState, useRef, useEffect } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import { RiRobotLine, RiSendPlaneLine, RiDeleteBin2Line, RiCpuLine, RiShieldLine, RiBarChartLine, RiLightbulbLine } from 'react-icons/ri';
import api from '../lib/api';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'Analyze my server performance',
  'Check for security vulnerabilities',
  'Why is my CPU usage high?',
  'Optimize my PHP configuration',
  'Explain my disk usage',
  'Suggest backup strategy',
];

export default function AIPage() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: '👋 Hi! I am **Devil AI**, your intelligent hosting assistant.\n\nI can help you with:\n- Server diagnostics & optimization\n- Security analysis & recommendations\n- Error log analysis\n- WordPress & PHP troubleshooting\n- Performance tuning\n\nWhat would you like to know?'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('tinyllama');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: msg, model });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'AI service unavailable. Make sure Ollama is running.';
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${errMsg}` }]);
    } finally { setLoading(false); }
  };

  return (
    <DashboardShell>
      <div className="dp-page-header">
        <div>
          <h1 className="dp-page-title">AI Assistant</h1>
          <p className="dp-page-subtitle">Powered by local open-source AI via Ollama (no data sent to cloud)</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="dp-select w-auto" value={model} onChange={e => setModel(e.target.value)}>
            <option value="tinyllama">TinyLlama (Fast)</option>
            <option value="phi">Phi-2 (Smart)</option>
            <option value="gemma:2b">Gemma 2B</option>
            <option value="deepseek-coder:1.3b">DeepSeek Lite</option>
            <option value="qwen:1.8b">Qwen 1.8B</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Messages */}
          <div className="dp-card flex-1 flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-devil-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-devil-text text-sm font-medium">Devil AI — {model}</span>
              </div>
              <button className="dp-btn-ghost dp-btn dp-btn-sm" onClick={() => setMessages([messages[0]])}>
                <RiDeleteBin2Line size={14} /> Clear
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '450px', minHeight: '350px' }}>
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 bg-devil-red/20 rounded-full flex items-center justify-center flex-shrink-0 border border-devil-red/30">
                      <RiRobotLine size={16} className="text-devil-red" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-devil-red/20 border border-devil-red/30 text-devil-text ml-auto'
                      : 'bg-devil-surface2 border border-devil-border text-devil-text'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-devil-red/20 rounded-full flex items-center justify-center border border-devil-red/30">
                    <RiRobotLine size={16} className="text-devil-red" />
                  </div>
                  <div className="bg-devil-surface2 border border-devil-border rounded-xl px-4 py-3">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-devil-muted rounded-full animate-bounce" style={{animationDelay: `${i*0.15}s`}} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-devil-border">
              <div className="flex gap-3">
                <input
                  className="dp-input flex-1"
                  placeholder="Ask me anything about your server..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  disabled={loading}
                />
                <button className="dp-btn-primary dp-btn" onClick={() => send()} disabled={loading || !input.trim()}>
                  <RiSendPlaneLine size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Quick actions */}
          <div className="dp-card">
            <h3 className="text-devil-text font-semibold text-sm mb-3">Quick Analysis</h3>
            <div className="flex flex-col gap-2">
              {[['Analyze Server',RiCpuLine],['Security Scan',RiShieldLine],['Performance',RiBarChartLine],['Suggestions',RiLightbulbLine]].map(([label, Icon]) => (
                <button key={label} className="dp-btn-secondary dp-btn dp-btn-sm justify-start" onClick={() => send(label)}>
                  <Icon size={14} />{label}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="dp-card">
            <h3 className="text-devil-text font-semibold text-sm mb-3">Suggestions</h3>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s, i) => (
                <button key={i}
                  className="text-left text-devil-muted text-xs hover:text-devil-red hover:bg-devil-red/5 px-2 py-1.5 rounded transition-all duration-200"
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Model info */}
          <div className="dp-card">
            <h3 className="text-devil-text font-semibold text-sm mb-3">AI Models</h3>
            <div className="flex flex-col gap-2 text-xs text-devil-muted">
              <p>✅ All AI runs <strong className="text-devil-text">100% locally</strong></p>
              <p>✅ No data sent to cloud</p>
              <p>✅ Powered by <strong className="text-devil-text">Ollama</strong></p>
              <p>✅ CPU-only inference</p>
              <p className="text-devil-muted">Gemini fallback available if Ollama offline</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
