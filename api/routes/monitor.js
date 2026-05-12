const router = require('express').Router();
const si     = require('systeminformation');
const { pool } = require('../db');
const { authenticate } = require('../middleware/auth');
const { apiLimiter }   = require('../middleware/rateLimit');

router.use(authenticate, apiLimiter);

// GET /monitoring/stats — live system stats
router.get('/stats', async (req, res) => {
  try {
    const [cpu, mem, disk, net, load] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.currentLoad()
    ]);
    res.json({
      cpu: {
        usage: Math.round(cpu.currentLoad),
        cores: cpu.cpus?.length || 0
      },
      memory: {
        total: mem.total,
        used:  mem.used,
        free:  mem.free,
        percent: Math.round((mem.used / mem.total) * 100)
      },
      disk: disk.map(d => ({
        fs:      d.fs,
        size:    d.size,
        used:    d.used,
        percent: Math.round(d.use)
      })),
      network: net.map(n => ({
        iface:   n.iface,
        rx_sec:  n.rx_sec,
        tx_sec:  n.tx_sec
      })),
      load_avg: load.avgLoad
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// GET /monitoring/history
router.get('/history', async (req, res) => {
  res.json({ data: [], message: 'History stored in time-series DB' });
});

// GET /monitoring/processes
router.get('/processes', async (req, res) => {
  try {
    const procs = await si.processes();
    const top = procs.list
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 20)
      .map(p => ({ pid: p.pid, name: p.name, cpu: p.cpu, mem: p.mem, state: p.state }));
    res.json({ data: top, count: procs.all });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get processes' });
  }
});

module.exports = router;
