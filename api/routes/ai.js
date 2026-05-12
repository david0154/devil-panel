const router = require('express').Router();
const axios  = require('axios');
const { pool } = require('../db');
const { authenticate } = require('../middleware/auth');
const { apiLimiter }   = require('../middleware/rateLimit');
const si = require('systeminformation');

router.use(authenticate, apiLimiter);

const OLLAMA_URL   = process.env.OLLAMA_URL   || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'tinyllama';
const GEMINI_KEY   = process.env.GEMINI_API_KEY;

async function callAI(prompt, history = []) {
  // Try Ollama first (local AI)
  try {
    const response = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: 'You are Devil Panel AI assistant. You help users manage their hosting, servers, domains, DNS, SSL, backups, and security. Be concise and technical.' },
        ...history,
        { role: 'user', content: prompt }
      ],
      stream: false
    }, { timeout: 30000 });
    return response.data.message?.content || 'No response from AI';
  } catch (e) {
    // Fallback to Gemini if available
    if (GEMINI_KEY) {
      const resp = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] }
      );
      return resp.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    }
    return 'AI service unavailable. Install Ollama or configure GEMINI_API_KEY.';
  }
}

// POST /ai/chat
router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    // Load last 10 messages for context
    const history = await pool.query(
      `SELECT role, content FROM ai_chat_history WHERE user_id=$1
       ORDER BY created_at DESC LIMIT 10`, [req.user.id]
    );
    const msgs = history.rows.reverse();

    const reply = await callAI(message, msgs);

    // Save to history
    await pool.query(
      `INSERT INTO ai_chat_history (user_id, role, content) VALUES ($1,'user',$2),($1,'assistant',$3)`,
      [req.user.id, message, reply]
    );

    res.json({ reply, model: OLLAMA_MODEL });
  } catch (e) {
    res.status(500).json({ error: 'AI chat failed', detail: e.message });
  }
});

// POST /ai/analyze — analyze server health
router.post('/analyze', async (req, res) => {
  try {
    const [cpu, mem, disk] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize()
    ]);

    const serverContext = `
Server Stats:
- CPU Usage: ${Math.round(cpu.currentLoad)}%
- RAM Used: ${Math.round((mem.used / mem.total) * 100)}% (${(mem.used/1024/1024/1024).toFixed(1)}GB / ${(mem.total/1024/1024/1024).toFixed(1)}GB)
- Disk: ${disk.map(d => `${d.fs}: ${Math.round(d.use)}%`).join(', ')}

Analyze these server metrics and provide:
1. Health assessment (Good/Warning/Critical)
2. Issues detected
3. Optimization recommendations
4. Security suggestions
`;

    const analysis = await callAI(serverContext);
    res.json({ analysis, stats: { cpu: Math.round(cpu.currentLoad), mem_percent: Math.round((mem.used/mem.total)*100) } });
  } catch (e) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// GET /ai/suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const prompt = 'Give 5 quick security and performance tips for a Linux web hosting server. Be brief, one line each.';
    const suggestions = await callAI(prompt);
    res.json({ data: suggestions });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// GET /ai/history
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id,role,content,created_at FROM ai_chat_history
       WHERE user_id=$1 ORDER BY created_at ASC LIMIT 100`,
      [req.user.id]
    );
    res.json({ data: result.rows });
  } catch (e) {
    res.status(500).json({ error: 'Server error' }); }
});

// DELETE /ai/history
router.delete('/history', async (req, res) => {
  try {
    await pool.query('DELETE FROM ai_chat_history WHERE user_id=$1', [req.user.id]);
    res.json({ message: 'Chat history cleared' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
