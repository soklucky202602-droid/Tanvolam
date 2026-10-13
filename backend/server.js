'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 10000);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'database.json');
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PRESENCE_TTL_MS = 3500;

app.set('trust proxy', 1);

// The frontend is a Render Static Site and the API is a separate Render
// Web Service. Authentication uses an httpOnly cookie, so credentialed
// cross-origin requests must explicitly allow the frontend origin.
const allowedOrigins = new Set([
  'https://tanvolam.onrender.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
]);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());

function ensureDataFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [], sessions: [], giftClaims: [] }, null, 2));
  }
}

function loadDb() {
  ensureDataFile();
  try {
    const db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    db.users = Array.isArray(db.users) ? db.users : [];
    db.sessions = Array.isArray(db.sessions) ? db.sessions : [];
    db.giftClaims = Array.isArray(db.giftClaims) ? db.giftClaims : [];
    return db;
  } catch (e) {
    return { users: [], sessions: [], giftClaims: [] };
  }
}

let db = loadDb();
let writeTimer = null;
function saveDbSoon() {
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    try {
      ensureDataFile();
      const tmp = DATA_FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
      fs.renameSync(tmp, DATA_FILE);
    } catch (e) {
      console.error('database write failed:', e.message);
    }
  }, 50);
}

const presence = new Map();

function cleanUsername(v) {
  return String(v || '').trim().toLowerCase();
}
function validUsername(v) {
  return /^[a-zA-Z0-9_]{3,24}$/.test(String(v || ''));
}
function safeUser(user) {
  return { id: user.id, username: user.username, createdAt: user.createdAt };
}
function emptyGame() {
  return {
    slots: [null, null, null],
    activeSlot: '0',
    shared: {
      jxidle_stash: null,
      jxidle_clan: null,
      jxxanh_stash: null,
      jxxanh_clan: null
    }
  };
}
function normalizeGame(game) {
  const src = game && typeof game === 'object' ? game : {};
  const slots = Array.isArray(src.slots) ? src.slots.slice(0, 3) : [null, null, null];
  while (slots.length < 3) slots.push(null);
  const shared = src.shared && typeof src.shared === 'object' ? src.shared : {};
  return {
    slots,
    activeSlot: String(src.activeSlot ?? '0'),
    shared: {
      jxidle_stash: shared.jxidle_stash ?? shared.jxxanh_stash ?? null,
      jxidle_clan: shared.jxidle_clan ?? shared.jxxanh_clan ?? null,
      jxxanh_stash: shared.jxxanh_stash ?? shared.jxidle_stash ?? null,
      jxxanh_clan: shared.jxxanh_clan ?? shared.jxidle_clan ?? null
    }
  };
}

function currentUser(req) {
  const sid = req.cookies.jx_session;
  if (!sid) return null;
  const now = Date.now();
  const session = db.sessions.find(s => s.id === sid && s.expiresAt > now);
  if (!session) return null;
  const user = db.users.find(u => u.id === session.userId);
  return user || null;
}
function requireUser(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Chưa đăng nhập' });
  req.user = user;
  next();
}
function createSession(user, res) {
  const sid = randomUUID();
  db.sessions = db.sessions.filter(s => s.userId !== user.id && s.expiresAt > Date.now());
  db.sessions.push({ id: sid, userId: user.id, expiresAt: Date.now() + SESSION_TTL_MS });
  saveDbSoon();
  res.cookie('jx_session', sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/'
  });
}

function parseGiftCodes() {
  const fallback = {
    TANTHU2026: { choices: [{ value: 'ttl_knb', label: '5 Tiên Thảo Lộ + 5 KNB' }] },
    VLTKH5: { choices: [{ value: 'ttl_knb', label: '5 Tiên Thảo Lộ + 5 KNB' }] },
    OPEN2026: { choices: [
      { value: 'ttl_knb', label: '5 Tiên Thảo Lộ + 5 KNB' },
      { value: 'kimphong', label: 'Bộ Kim Phong + 5 Tiên Thảo Lộ + 5 KNB' }
    ] }
  };
  if (!process.env.GIFTCODES_JSON) return fallback;
  try {
    const parsed = JSON.parse(process.env.GIFTCODES_JSON);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}
function claimKey(userId, code) { return userId + ':' + code; }

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'tanvolam-api', time: new Date().toISOString() }));
app.get('/api/public/simbot-status', (req, res) => res.json({ simbotEnabled: process.env.SIMBOT_ENABLED !== 'false' }));
app.get('/api/public/server-open', (req, res) => {
  const openTime = process.env.SERVER_OPEN_TIME || '2026-10-10T13:30:00+07:00';
  const forced = process.env.SERVER_OPEN === 'true';
  const open = forced || Date.now() >= new Date(openTime).getTime();
  res.json({
    open,
    openTime,
    serverTime: new Date().toISOString(),
    message: open ? 'Máy chủ đang mở.' : 'Máy chủ chưa chính thức mở.'
  });
});

app.post('/api/auth/register', async (req, res) => {
  const usernameRaw = String(req.body?.username || '').trim();
  const username = cleanUsername(usernameRaw);
  const password = String(req.body?.password || '');
  if (!validUsername(usernameRaw)) return res.status(400).json({ error: 'Tài khoản 3-24 ký tự, chỉ gồm chữ, số và _.' });
  if (password.length < 6 || password.length > 128) return res.status(400).json({ error: 'Mật khẩu phải từ 6 đến 128 ký tự.' });
  if (db.users.some(u => u.username === username)) return res.status(409).json({ error: 'Tài khoản đã tồn tại.' });

  const user = {
    id: randomUUID(),
    username,
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString(),
    revision: 0,
    game: emptyGame()
  };
  db.users.push(user);
  saveDbSoon();
  createSession(user, res);
  res.json({ user: safeUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const username = cleanUsername(req.body?.username);
  const password = String(req.body?.password || '');
  const user = db.users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Sai tài khoản hoặc mật khẩu.' });
  createSession(user, res);
  res.json({ user: safeUser(user) });
});

app.get('/api/auth/me', requireUser, (req, res) => res.json({ user: safeUser(req.user) }));
app.post('/api/auth/logout', (req, res) => {
  const sid = req.cookies.jx_session;
  if (sid) db.sessions = db.sessions.filter(s => s.id !== sid);
  saveDbSoon();
  res.clearCookie('jx_session', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
  res.json({ ok: true });
});

app.get('/api/game/state', requireUser, (req, res) => {
  res.json({ game: normalizeGame(req.user.game), revision: Number(req.user.revision || 0) });
});

app.put('/api/game/state', requireUser, (req, res) => {
  const clientRevision = Number(req.body?.revision);
  const currentRevision = Number(req.user.revision || 0);
  if (!Number.isInteger(clientRevision) || clientRevision !== currentRevision) {
    return res.status(409).json({ error: 'Dữ liệu đã thay đổi ở nơi khác.', revision: currentRevision });
  }
  const game = normalizeGame(req.body?.game);
  const serialized = JSON.stringify(game);
  if (serialized.length > 3500000) return res.status(413).json({ error: 'Dữ liệu nhân vật quá lớn.' });
  req.user.game = game;
  req.user.revision = currentRevision + 1;
  saveDbSoon();
  res.json({ ok: true, revision: req.user.revision });
});

app.get('/api/ranking', (req, res) => {
  const ranking = [];
  for (const user of db.users) {
    const game = normalizeGame(user.game);
    for (const slot of game.slots) {
      if (!slot || typeof slot !== 'object') continue;
      const name = String(slot.name || '').trim();
      if (!name) continue;
      ranking.push({
        name,
        fac: slot.fac || 'shaolin',
        lvl: Number(slot.lvl || 1),
        stage: Number(slot.stage || 1),
        gold: Number(slot.gold || 0)
      });
    }
  }
  ranking.sort((a, b) => b.lvl - a.lvl || b.stage - a.stage || b.gold - a.gold);
  res.json({ ranking: ranking.slice(0, 200) });
});

app.post('/api/world/presence', requireUser, (req, res) => {
  const p = req.body || {};
  const clientId = String(p.clientId || '').slice(0, 100);
  if (!clientId) return res.status(400).json({ error: 'Thiếu clientId' });
  const now = Date.now();
  presence.set(req.user.id + ':' + clientId, {
    userId: req.user.id,
    clientId,
    name: String(p.name || 'Đại hiệp').slice(0, 32),
    fac: String(p.fac || 'shaolin').slice(0, 32),
    sex: Number(p.sex || 0), lvl: Number(p.lvl || 1),
    hp: Number(p.hp || 0), maxHp: Number(p.maxHp || 0),
    x: Number(p.x || 0), y: Number(p.y || 0), dir: Number(p.dir || 0),
    act: String(p.act || 'st').slice(0, 20), moving: !!p.moving,
    isTown: !!p.isTown, zoneId: p.zoneId ?? 1, ride: !!p.ride,
    seenAt: now
  });
  for (const [key, value] of presence) if (now - value.seenAt > PRESENCE_TTL_MS) presence.delete(key);
  const peers = [];
  for (const value of presence.values()) {
    if (value.userId === req.user.id && value.clientId === clientId) continue;
    peers.push(value);
  }
  res.json({ ok: true, peers });
});

app.post('/api/gift-codes/redeem', requireUser, (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  const all = parseGiftCodes();
  if (!code || !all[code]) return res.status(404).json({ error: 'Mã quà không hợp lệ.' });
  if (db.giftClaims.some(x => x === claimKey(req.user.id, code))) return res.status(409).json({ error: 'Mã này đã được nhận.' });
  res.json({ ok: true, choices: Array.isArray(all[code].choices) ? all[code].choices : [] });
});

app.post('/api/gift-codes/choose', requireUser, (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
  const choice = String(req.body?.choice || '').trim();
  const all = parseGiftCodes();
  if (!code || !all[code]) return res.status(404).json({ error: 'Mã quà không hợp lệ.' });
  if (!choice) return res.status(400).json({ error: 'Thiếu lựa chọn.' });
  if (db.giftClaims.some(x => x === claimKey(req.user.id, code))) return res.status(409).json({ error: 'Mã này đã được nhận.' });
  const valid = (all[code].choices || []).some(x => String(x.value) === choice);
  if (!valid) return res.status(400).json({ error: 'Lựa chọn không hợp lệ.' });
  db.giftClaims.push(claimKey(req.user.id, code));
  saveDbSoon();
  res.json({ ok: true, code, choice });
});

const PORT_HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, PORT_HOST, () => console.log(`Tanvolam API listening on ${PORT_HOST}:${PORT}`));
