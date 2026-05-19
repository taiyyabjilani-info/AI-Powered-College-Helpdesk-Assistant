/* ═══════════════════════════════════════════════════════════
   script.js — NexusEdu AI Chatbot Frontend Logic
   ═══════════════════════════════════════════════════════════ */

/* ── State ───────────────────────────────────────────────────── */
let isWaiting   = false;
let darkMode    = true;
let msgCount    = 0;

/* ── Greeting pool ───────────────────────────────────────────── */
const GREETINGS = [
  "👋 Hello, champ! How can I assist you today?",
  "🎓 Welcome! I'm NEXUS, your AI college assistant. What can I help you with?",
  "✨ Hi there! Ask me anything about admissions, courses, exams, or campus life!",
  "🚀 Ready to help! What college-related query can I answer for you?"
];

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  // Auto-greet after short delay
  setTimeout(() => addBotMessage(
    GREETINGS[Math.floor(Math.random() * GREETINGS.length)],
    'greeting',
    100
  ), 800);
});

/* ── Clock ───────────────────────────────────────────────────── */
function startClock() {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = `${h}:${m}`;
    document.getElementById('date-display').textContent =
      now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  tick();
  setInterval(tick, 60000);
}

/* ── Panel navigation ────────────────────────────────────────── */
function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`panel-${name}`).classList.add('active');
  event.currentTarget.classList.add('active');

  if (name === 'history') loadHistory();
  if (name === 'stats')   loadStats();
}

/* ── Sidebar ─────────────────────────────────────────────────── */
function toggleSidebar() {
  const s = document.querySelector('.sidebar');
  s.classList.toggle('open');
}

/* ── Theme ───────────────────────────────────────────────────── */
function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle('light-mode', !darkMode);
  showToast(darkMode ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
}

/* ── Send message ────────────────────────────────────────────── */
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

async function sendMessage() {
  if (isWaiting) return;
  const input = document.getElementById('userInput');
  const text  = input.value.trim();
  if (!text) return;

  input.value = '';
  isWaiting   = true;
  document.getElementById('sendBtn').disabled = true;

  // Hide welcome banner on first message
  if (msgCount === 0) {
    const banner = document.getElementById('welcomeBanner');
    if (banner) { banner.style.opacity = '0'; setTimeout(() => banner.remove(), 400); }
  }
  msgCount++;

  addUserMessage(text);
  showTyping(true);

  try {
    const res  = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();

    await simulateDelay(700 + Math.random() * 600);
    showTyping(false);
    addBotMessage(data.response, data.intent, data.confidence, data.timestamp);
  } catch (err) {
    showTyping(false);
    addBotMessage('⚠️ Oops! I had trouble connecting. Please try again.', 'error', 0);
  } finally {
    isWaiting = false;
    document.getElementById('sendBtn').disabled = false;
    input.focus();
  }
}

function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ── Insert quick query ──────────────────────────────────────── */
function insertQuery(text) {
  // Switch to chat panel
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-chat').classList.add('active');
  document.querySelectorAll('.nav-item')[0].classList.add('active');

  document.getElementById('userInput').value = text;
  document.getElementById('userInput').focus();

  // On mobile close sidebar
  document.querySelector('.sidebar').classList.remove('open');
}

/* ── Message rendering ───────────────────────────────────────── */
function addUserMessage(text) {
  const area = document.getElementById('chatArea');
  const row  = document.createElement('div');
  row.className = 'message-row user';
  row.innerHTML = `
    <div>
      <div class="bubble">${escapeHtml(text)}</div>
      <div class="bubble-meta" style="justify-content:flex-end">
        ${formatTime()}
      </div>
    </div>
  `;
  area.appendChild(row);
  scrollBottom();
}

function addBotMessage(text, intent, confidence, timestamp) {
  const area = document.getElementById('chatArea');
  const row  = document.createElement('div');
  row.className = 'message-row bot';

  const badgesHtml = (intent && intent !== 'error')
    ? `<span class="intent-badge">${intent}</span><span class="confidence-badge">${confidence}% confidence</span>`
    : '';

  row.innerHTML = `
    <div class="bot-avatar-sm">AI</div>
    <div>
      <div class="bubble">${formatMarkdown(text)}</div>
      <div class="bubble-meta">
        ${timestamp || formatTime()}
        ${badgesHtml}
      </div>
    </div>
  `;
  area.appendChild(row);
  scrollBottom();
}

/* ── Typing indicator ────────────────────────────────────────── */
function showTyping(visible) {
  const t = document.getElementById('typingIndicator');
  t.classList.toggle('hidden', !visible);
  if (visible) scrollBottom();
}

/* ── Scroll chat to bottom ───────────────────────────────────── */
function scrollBottom() {
  const area = document.getElementById('chatArea');
  setTimeout(() => area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' }), 50);
}

/* ── Clear chat ──────────────────────────────────────────────── */
function clearChat() {
  const area = document.getElementById('chatArea');
  area.innerHTML = '';
  msgCount = 0;
  showToast('🗑️ Chat cleared');
  // Re-add welcome banner
  const banner = document.createElement('div');
  banner.className = 'welcome-banner';
  banner.id = 'welcomeBanner';
  banner.innerHTML = `
    <div class="welcome-glow"></div>
    <div class="bot-avatar-large">
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
        <rect width="80" height="80" rx="20" fill="url(#bg2)" opacity="0.2"/>
        <circle cx="40" cy="32" r="14" fill="url(#bg2)"/>
        <rect x="20" y="50" width="40" height="24" rx="10" fill="url(#bg2)"/>
        <circle cx="33" cy="30" r="3" fill="white"/>
        <circle cx="47" cy="30" r="3" fill="white"/>
        <path d="M33 38 Q40 43 47 38" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    </div>
    <h2 class="welcome-title">Hello! I'm NEXUS</h2>
    <p class="welcome-sub">Your AI-powered college helpdesk assistant.</p>
    <div class="welcome-tags">
      <span>🎓 Admissions</span><span>📚 Courses</span><span>📝 Exams</span>
      <span>🏠 Hostel</span><span>💼 Placements</span>
    </div>`;
  area.appendChild(banner);
}

/* ── History ─────────────────────────────────────────────────── */
async function loadHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '<div class="loading-state">Loading history…</div>';
  try {
    const res  = await fetch('/api/history');
    const data = await res.json();
    if (!data.length) {
      list.innerHTML = '<div class="loading-state">No chat history yet.</div>';
      return;
    }
    list.innerHTML = data.map(item => `
      <div class="history-item">
        <div class="h-user">💬 ${escapeHtml(item.user_msg)}</div>
        <div class="h-bot">${escapeHtml(item.bot_reply.substring(0, 200))}…</div>
        <div class="h-meta">
          <span>${formatDatetime(item.timestamp)}</span>
          <span class="intent-badge">${item.intent || 'unknown'}</span>
          <span class="confidence-badge">${item.confidence || 0}%</span>
        </div>
      </div>
    `).join('');
  } catch {
    list.innerHTML = '<div class="loading-state">Failed to load history.</div>';
  }
}

async function clearHistoryDB() {
  if (!confirm('Clear all chat history from database?')) return;
  try {
    await fetch('/api/clear_history', { method: 'POST' });
    showToast('🗑️ History cleared from database');
    loadHistory();
  } catch {
    showToast('❌ Failed to clear history');
  }
}

/* ── Stats ───────────────────────────────────────────────────── */
async function loadStats() {
  const grid = document.getElementById('statsGrid');
  grid.innerHTML = '<div class="loading-state">Loading analytics…</div>';
  try {
    const res  = await fetch('/api/stats');
    const data = await res.json();
    const maxCount = data.top_intents.length ? Math.max(...data.top_intents.map(i => i.cnt)) : 1;

    grid.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${data.total_queries}</div>
        <div class="stat-label">Total Queries</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.avg_confidence}%</div>
        <div class="stat-label">Avg. Confidence</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.top_intents.length}</div>
        <div class="stat-label">Intent Categories Hit</div>
      </div>
      <div class="intents-card">
        <h3>Top Queried Topics</h3>
        ${data.top_intents.map(i => `
          <div class="intent-bar-row">
            <div class="intent-bar-label">${i.intent}</div>
            <div class="intent-bar-track">
              <div class="intent-bar-fill" style="width:${(i.cnt/maxCount)*100}%"></div>
            </div>
            <div class="intent-bar-count">${i.cnt}</div>
          </div>
        `).join('') || '<div style="color:var(--text-muted);font-size:13px">No data yet.</div>'}
      </div>
    `;
  } catch {
    grid.innerHTML = '<div class="loading-state">Failed to load analytics.</div>';
  }
}

/* ── Retrain ─────────────────────────────────────────────────── */
async function retrainModel() {
  const status = document.getElementById('retrain-status');
  status.className = 'retrain-status';
  status.textContent = '🔄 Retraining model, please wait…';
  try {
    const res  = await fetch('/api/retrain', { method: 'POST' });
    const data = await res.json();
    status.className = data.status === 'success' ? 'retrain-status success' : 'retrain-status error';
    status.textContent = data.status === 'success' ? '✅ ' + data.message : '❌ ' + data.message;
  } catch {
    status.className = 'retrain-status error';
    status.textContent = '❌ Network error during retrain';
  }
}

/* ── Toast ───────────────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── Helpers ─────────────────────────────────────────────────── */
function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function formatMarkdown(text) {
  // Bold **text**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Bullets: lines starting with •
  text = text.replace(/^([•→✅📋🔵🟣💰🏠📚👨‍🏫⏰🚌🎉💼🏛️🌟📞📝🎓💡])\s(.+)$/gm,
    '<span style="display:block;margin:2px 0">$1 $2</span>');
  // Line breaks
  text = text.replace(/\n/g, '<br>');
  return text;
}

function formatTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDatetime(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return iso; }
}
