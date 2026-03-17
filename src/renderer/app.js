'use strict';

// ── State ──────────────────────────────────────────────────────────────────
let trades = [];          // Array of trade objects
let editingId = null;     // ID of trade currently being edited (null = add mode)

// ── DOM refs ───────────────────────────────────────────────────────────────
const form        = document.getElementById('tradeForm');
const formTitle   = document.getElementById('formTitle');
const submitBtn   = document.getElementById('submitBtn');
const cancelBtn   = document.getElementById('cancelEditBtn');
const formError   = document.getElementById('formError');
const tradesBody  = document.getElementById('tradesBody');
const emptyMsg    = document.getElementById('emptyMsg');

const fDate      = document.getElementById('fDate');
const fPair      = document.getElementById('fPair');
const fDirection = document.getElementById('fDirection');
const fEntry     = document.getElementById('fEntry');
const fSL        = document.getElementById('fSL');
const fTP        = document.getElementById('fTP');
const fRisk      = document.getElementById('fRisk');
const fOutcome   = document.getElementById('fOutcome');
const fNotes     = document.getElementById('fNotes');
const editId     = document.getElementById('editId');

// Stats
const statTotal   = document.getElementById('statTotal');
const statWins    = document.getElementById('statWins');
const statLosses  = document.getElementById('statLosses');
const statBE      = document.getElementById('statBE');
const statWinRate = document.getElementById('statWinRate');
const statAvgRR   = document.getElementById('statAvgRR');

// ── Helpers ────────────────────────────────────────────────────────────────

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Calculate Risk:Reward ratio.
 * RR = |TP - Entry| / |SL - Entry|
 * Returns null if inputs are invalid or SL === Entry.
 */
function calcRR(entry, sl, tp) {
  const e = parseFloat(entry);
  const s = parseFloat(sl);
  const t = parseFloat(tp);
  if (isNaN(e) || isNaN(s) || isNaN(t)) return null;
  const risk   = Math.abs(e - s);
  const reward = Math.abs(t - e);
  if (risk === 0) return null;
  return reward / risk;
}

function formatRR(rr) {
  if (rr === null || rr === undefined) return '—';
  return '1:' + rr.toFixed(2);
}

function formatNum(n) {
  if (n === null || n === undefined || n === '') return '—';
  return parseFloat(n).toString();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ── Persistence ────────────────────────────────────────────────────────────

async function loadTrades() {
  trades = await window.tradeAPI.loadTrades();
  render();
}

async function saveTrades() {
  await window.tradeAPI.saveTrades(trades);
}

// ── Render ─────────────────────────────────────────────────────────────────

function render() {
  renderStats();
  renderTable();
}

function renderStats() {
  const closed = trades.filter(t => t.outcome !== 'Open');
  const wins   = trades.filter(t => t.outcome === 'Win').length;
  const losses = trades.filter(t => t.outcome === 'Loss').length;
  const be     = trades.filter(t => t.outcome === 'BE').length;

  const winRate = closed.length > 0
    ? ((wins / closed.length) * 100).toFixed(1) + '%'
    : '0%';

  const rrValues = trades
    .map(t => t.rr)
    .filter(r => r !== null && r !== undefined);
  const avgRR = rrValues.length > 0
    ? (rrValues.reduce((a, b) => a + b, 0) / rrValues.length).toFixed(2)
    : '0.00';

  statTotal.textContent   = trades.length;
  statWins.textContent    = wins;
  statLosses.textContent  = losses;
  statBE.textContent      = be;
  statWinRate.textContent = winRate;
  statAvgRR.textContent   = avgRR;
}

function renderTable() {
  // Newest first
  const sorted = [...trades].sort((a, b) => (b.date > a.date ? 1 : -1));

  if (sorted.length === 0) {
    tradesBody.innerHTML = '';
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  tradesBody.innerHTML = sorted.map(t => {
    const rrText  = formatRR(t.rr);
    const rrClass = t.rr !== null && t.rr !== undefined
      ? (t.rr >= 1 ? 'rr-positive' : 'rr-negative')
      : '';

    const outcomeBadge = {
      Win:  '<span class="badge badge-win">Win</span>',
      Loss: '<span class="badge badge-loss">Loss</span>',
      BE:   '<span class="badge badge-be">BE</span>',
      Open: '<span class="badge badge-open">Open</span>'
    }[t.outcome] || t.outcome;

    const dirBadge = t.direction === 'Buy'
      ? '<span class="badge badge-buy">Buy</span>'
      : '<span class="badge badge-sell">Sell</span>';

    return `
      <tr>
        <td>${t.date}</td>
        <td><strong>${escHtml(t.pair)}</strong></td>
        <td>${dirBadge}</td>
        <td>${formatNum(t.entry)}</td>
        <td>${formatNum(t.sl)}</td>
        <td>${formatNum(t.tp)}</td>
        <td>${formatNum(t.risk)}%</td>
        <td class="${rrClass}">${rrText}</td>
        <td>${outcomeBadge}</td>
        <td class="notes-cell" title="${escHtml(t.notes || '')}">${escHtml(t.notes || '')}</td>
        <td>
          <button class="btn-icon edit" onclick="startEdit('${t.id}')" title="Edit">✏</button>
          <button class="btn-icon del"  onclick="deleteTrade('${t.id}')" title="Delete">✕</button>
        </td>
      </tr>`;
  }).join('');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Form Handling ──────────────────────────────────────────────────────────

function resetForm() {
  form.reset();
  fDate.value = today();
  editId.value = '';
  editingId = null;
  formTitle.textContent = 'Add Trade';
  submitBtn.textContent = 'Add Trade';
  cancelBtn.style.display = 'none';
  formError.textContent = '';
  clearInvalid();
}

function clearInvalid() {
  [fDate, fPair, fEntry, fSL, fTP, fRisk].forEach(el => el.classList.remove('invalid'));
}

function validate() {
  clearInvalid();
  let ok = true;
  const errors = [];

  if (!fDate.value)  { fDate.classList.add('invalid');  errors.push('Date is required.'); ok = false; }
  if (!fPair.value.trim()) { fPair.classList.add('invalid'); errors.push('Pair is required.'); ok = false; }

  const entry = parseFloat(fEntry.value);
  const sl    = parseFloat(fSL.value);
  const tp    = parseFloat(fTP.value);
  const risk  = parseFloat(fRisk.value);

  if (isNaN(entry)) { fEntry.classList.add('invalid'); errors.push('Entry price must be a number.'); ok = false; }
  if (isNaN(sl))    { fSL.classList.add('invalid');    errors.push('Stop loss must be a number.'); ok = false; }
  if (isNaN(tp))    { fTP.classList.add('invalid');    errors.push('Take profit must be a number.'); ok = false; }
  if (isNaN(risk) || risk < 0) { fRisk.classList.add('invalid'); errors.push('Risk % must be a non-negative number.'); ok = false; }

  formError.textContent = errors.join(' ');
  return ok;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const entry = parseFloat(fEntry.value);
  const sl    = parseFloat(fSL.value);
  const tp    = parseFloat(fTP.value);
  const rr    = calcRR(entry, sl, tp);

  if (editingId) {
    // Update existing trade
    const idx = trades.findIndex(t => t.id === editingId);
    if (idx !== -1) {
      trades[idx] = {
        ...trades[idx],
        date:      fDate.value,
        pair:      fPair.value.trim().toUpperCase(),
        direction: fDirection.value,
        entry,
        sl,
        tp,
        risk:      parseFloat(fRisk.value),
        outcome:   fOutcome.value,
        notes:     fNotes.value.trim(),
        rr
      };
    }
  } else {
    // Add new trade
    const trade = {
      id:        generateId(),
      date:      fDate.value,
      pair:      fPair.value.trim().toUpperCase(),
      direction: fDirection.value,
      entry,
      sl,
      tp,
      risk:      parseFloat(fRisk.value),
      outcome:   fOutcome.value,
      notes:     fNotes.value.trim(),
      rr
    };
    trades.push(trade);
  }

  await saveTrades();
  resetForm();
  render();
});

cancelBtn.addEventListener('click', resetForm);

// ── Edit ───────────────────────────────────────────────────────────────────

function startEdit(id) {
  const t = trades.find(t => t.id === id);
  if (!t) return;

  editingId         = id;
  editId.value      = id;
  fDate.value       = t.date;
  fPair.value       = t.pair;
  fDirection.value  = t.direction;
  fEntry.value      = t.entry;
  fSL.value         = t.sl;
  fTP.value         = t.tp;
  fRisk.value       = t.risk;
  fOutcome.value    = t.outcome;
  fNotes.value      = t.notes || '';

  formTitle.textContent = 'Edit Trade';
  submitBtn.textContent = 'Save Changes';
  cancelBtn.style.display = 'inline-block';
  formError.textContent = '';

  // Scroll to form
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// ── Delete ─────────────────────────────────────────────────────────────────

async function deleteTrade(id) {
  trades = trades.filter(t => t.id !== id);
  await saveTrades();
  render();
}

// ── Init ───────────────────────────────────────────────────────────────────

fDate.value = today();
loadTrades();
