// =====================================================================
// CATEGORIES
// =====================================================================
const CATEGORIES = {
  vivienda:      { label: 'Vivienda',       emoji: '🏠', color: '#7c4dff' },
  alimentacion:  { label: 'Alimentacion',   emoji: '🛒', color: '#00e5ff' },
  restaurantes:  { label: 'Restaurantes',   emoji: '🍽', color: '#ffd740' },
  transporte:    { label: 'Transporte',     emoji: '🚗', color: '#ff9800' },
  ocio:          { label: 'Ocio',           emoji: '🎮', color: '#e91e63' },
  salud:         { label: 'Salud',          emoji: '💊', color: '#00c853' },
  ropa:          { label: 'Ropa',           emoji: '👕', color: '#aa00ff' },
  suscripciones: { label: 'Suscripciones',  emoji: '📱', color: '#ff5722' },
  educacion:     { label: 'Educacion',      emoji: '📚', color: '#2196f3' },
  otros:         { label: 'Otros',          emoji: '📦', color: '#607d8b' },
};

const INCOME_CATEGORIES = {
  salario:     { label: 'Salario',      emoji: '💼', color: '#00c853' },
  freelance:   { label: 'Freelance',    emoji: '💻', color: '#00e5ff' },
  alquiler:    { label: 'Alquiler',     emoji: '🏠', color: '#7c4dff' },
  negocio:     { label: 'Negocio',      emoji: '🏪', color: '#ffd740' },
  dividendos:  { label: 'Dividendos',   emoji: '📈', color: '#ff9800' },
  regalo:      { label: 'Regalo',       emoji: '🎁', color: '#e91e63' },
  otros_ing:   { label: 'Otros',        emoji: '💰', color: '#607d8b' },
};

const SAVINGS_CATEGORIES = {
  cuenta:      { label: 'Cuenta ahorro', emoji: '🏦', color: '#ffd740' },
  emergencia:  { label: 'Emergencia',    emoji: '🛡️', color: '#ff9800' },
  meta:        { label: 'Meta/Hucha',    emoji: '🎯', color: '#00c853' },
  pension:     { label: 'Pensión',       emoji: '📋', color: '#7c4dff' },
  otros_aho:   { label: 'Otros',         emoji: '💰', color: '#607d8b' },
};

const INVESTMENT_CATEGORIES = {
  inv_bolsa:    { label: 'Bolsa/ETF',  emoji: '📈', color: '#00e5ff' },
  inv_cripto:   { label: 'Cripto',     emoji: '🪙', color: '#ffd740' },
  inv_inmueble: { label: 'Inmueble',   emoji: '🏗', color: '#7c4dff' },
  inv_fondo:    { label: 'Fondo',      emoji: '📊', color: '#00c853' },
  inv_pension:  { label: 'Pensión',    emoji: '🏦', color: '#ff9800' },
  inv_otros:    { label: 'Otros',      emoji: '💼', color: '#607d8b' },
};

const BASE_CATEGORIES = {
  expense:    CATEGORIES,
  income:     INCOME_CATEGORIES,
  savings:    SAVINGS_CATEGORIES,
  investment: INVESTMENT_CATEGORIES,
};

// =====================================================================
// DB — localStorage wrapper
// =====================================================================
const DB = {
  getTransactions() {
    return JSON.parse(localStorage.getItem('ft_tx') || '[]');
  },
  saveTransactions(txs) {
    localStorage.setItem('ft_tx', JSON.stringify(txs));
  },
  addTransaction(tx) {
    const txs = this.getTransactions();
    tx.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    txs.push(tx);
    this.saveTransactions(txs);
    return tx;
  },
  deleteTransaction(id) {
    this.saveTransactions(this.getTransactions().filter(t => t.id !== id));
  },
  getSettings() {
    const defaults = { refIncome: 0, goalType: 'amount', goalValue: 0, budgets: {}, baseBalance: 0, savingsMode: 'month' };
    return Object.assign(defaults, JSON.parse(localStorage.getItem('ft_settings') || '{}'));
  },
  saveSettings(s) {
    localStorage.setItem('ft_settings', JSON.stringify(s));
  },
  // Custom categories per type
  // 'expense' uses legacy key ft_custom_cats for backward compat
  getCustomCategoriesForType(type) {
    const key = type === 'expense' ? 'ft_custom_cats' : `ft_custom_cats_${type}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },
  saveCustomCategoriesForType(type, cats) {
    const key = type === 'expense' ? 'ft_custom_cats' : `ft_custom_cats_${type}`;
    localStorage.setItem(key, JSON.stringify(cats));
  },
  // Legacy alias used by existing code paths
  getCustomCategories() { return this.getCustomCategoriesForType('expense'); },
  saveCustomCategories(cats) { return this.saveCustomCategoriesForType('expense', cats); },
};

// =====================================================================
// DYNAMIC CATEGORIES
// =====================================================================
function getAllCategoriesForType(type) {
  const base = { ...(BASE_CATEGORIES[type] || CATEGORIES) };
  DB.getCustomCategoriesForType(type).forEach(cat => {
    base[cat.id] = { label: cat.label, emoji: cat.emoji, color: cat.color, custom: true };
  });
  return base;
}

// Keep for budget/chart functions that only deal with expenses
function getAllCategories() { return getAllCategoriesForType('expense'); }

function getCategoryForTransaction(tx) {
  const allCats = getAllCategoriesForType(tx.type);
  return allCats[tx.category] || { label: tx.type, emoji: '💰', color: '#607d8b' };
}

const CAT_EMOJIS = [
  '🏠','🛒','🍽','🚗','🎮','💊','👕','📱','📚','📦',
  '💰','🏋️','✈️','🎬','🎵','🐕','🏥','💅','🎓','🛍️',
  '🍺','☕','🎁','🏖','💄','🔧','🚌','⛽','🍕','🎪',
  '💍','🏊','🎯','📸','🌱','🏡','👶','🎭','🎲','💻',
  '🚀','🎸','🍷','🛁','🐱','🌍','💌','🎀','💼','🏦',
  '📋','🛡️','🏗','🪙','📊','🎯','🏪','📈',
];

const CAT_COLORS = [
  '#7c4dff','#00e5ff','#ffd740','#ff9800',
  '#e91e63','#00c853','#aa00ff','#ff5722',
  '#2196f3','#607d8b','#ff3d71','#00bfa5',
];

// =====================================================================
// STATE
// =====================================================================
const state = {
  currentMonth: todayMonth(),
  activeView: 'dashboard',
  txType: 'expense',
  selectedCat: null,
  deleteId: null,
  catEmoji: '📦',
  catColor: '#7c4dff',
  catModalSource: null,
  catModalType: 'expense',
  customCatTab: 'expense',
};

const charts = { category: null, trend: null, investment: null };

// =====================================================================
// DATE / FORMAT HELPERS
// =====================================================================
function todayMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function fmtMonth(ym) {
  const [y, m] = ym.split('-');
  const names = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return `${names[parseInt(m, 10) - 1]} ${y}`;
}

function prevMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function nextMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function fmtEuro(n) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n) + ' €';
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer';

  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

// =====================================================================
// DATA QUERIES
// =====================================================================
function getTxs(ym) {
  ym = ym || state.currentMonth;
  return DB.getTransactions().filter(tx => tx.date.startsWith(ym));
}

function getExpenses(ym)    { return getTxs(ym).filter(t => t.type === 'expense'); }
function getIncomes(ym)     { return getTxs(ym).filter(t => t.type === 'income'); }
function getSavingsType(ym) { return getTxs(ym).filter(t => t.type === 'savings'); }
function getInvestments(ym) { return getTxs(ym).filter(t => t.type === 'investment'); }
function sum(txs)           { return txs.reduce((s, t) => s + t.amount, 0); }

function expenseByCategory(ym) {
  const result = {};
  getExpenses(ym).forEach(tx => {
    result[tx.category] = (result[tx.category] || 0) + tx.amount;
  });
  return result;
}

function investmentByCategory(ym) {
  const result = {};
  getInvestments(ym).forEach(tx => {
    result[tx.category] = (result[tx.category] || 0) + tx.amount;
  });
  return result;
}

// =====================================================================
// RENDER: DASHBOARD
// =====================================================================
function renderDashboard() {
  const settings        = DB.getSettings();
  const totalExpense    = sum(getExpenses());
  const totalIncome     = sum(getIncomes());
  const totalSavingsT   = sum(getSavingsType());
  const totalInvestment = sum(getInvestments());

  document.getElementById('dash-income').textContent  = fmtEuro(totalIncome);
  document.getElementById('dash-expense').textContent = fmtEuro(totalExpense);

  const allTxs = DB.getTransactions().filter(t => t.date.substring(0, 7) <= state.currentMonth);
  const disponible = (settings.baseBalance || 0)
    + sum(allTxs.filter(t => t.type === 'income'))
    - sum(allTxs.filter(t => t.type === 'expense'))
    - sum(allTxs.filter(t => t.type === 'savings'))
    - sum(allTxs.filter(t => t.type === 'investment'));

  const balEl = document.getElementById('dash-balance');
  balEl.textContent = fmtEuro(disponible);
  balEl.style.color = disponible >= 0 ? 'var(--green)' : 'var(--red)';

  const savEl = document.getElementById('dash-savings');
  savEl.textContent = fmtEuro(totalSavingsT);
  savEl.style.color = totalSavingsT > 0 ? 'var(--yellow)' : 'var(--muted)';

  const badge = document.getElementById('dash-savings-badge');
  if (totalSavingsT > 0) badge.classList.remove('hidden');
  else badge.classList.add('hidden');

  const margenLibre = totalIncome - totalExpense - totalSavingsT - totalInvestment;
  const extraEl = document.getElementById('dash-savings-extra');
  const parts = [];
  if (margenLibre > 0) parts.push(`Margen libre: ${fmtEuro(margenLibre)}`);
  if (totalInvestment > 0) parts.push(`Invertido: ${fmtEuro(totalInvestment)}`);
  if (parts.length > 0) {
    extraEl.textContent = parts.join('  ·  ');
    extraEl.classList.remove('hidden');
  } else {
    extraEl.classList.add('hidden');
  }

  const allTxsPrev = DB.getTransactions().filter(t => !t.date.startsWith(state.currentMonth));
  const prevDisp = (settings.baseBalance || 0)
    + sum(allTxsPrev.filter(t => t.type === 'income'))
    - sum(allTxsPrev.filter(t => t.type === 'expense'))
    - sum(allTxsPrev.filter(t => t.type === 'savings'))
    - sum(allTxsPrev.filter(t => t.type === 'investment'));
  const refIncome = settings.savingsMode === 'cumulative' ? prevDisp + totalIncome : totalIncome;
  const goalEuros = calcGoalEuros(settings, refIncome);

  document.querySelectorAll('.smode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.smode === (settings.savingsMode || 'month'));
  });

  const fillEl = document.getElementById('dash-savings-fill');
  const pctEl  = document.getElementById('dash-savings-pct');
  const goalEl = document.getElementById('dash-savings-goal');

  if (goalEuros > 0) {
    const pct = Math.min(100, Math.max(0, (totalSavingsT / goalEuros) * 100));
    fillEl.style.width      = pct + '%';
    fillEl.style.background = totalSavingsT >= goalEuros
      ? 'linear-gradient(90deg, var(--green), #69f0ae)'
      : 'linear-gradient(90deg, #ffd740, #ffab00)';
    pctEl.textContent  = `${Math.round(pct)}% del objetivo`;
    goalEl.textContent = `Meta: ${fmtEuro(goalEuros)}`;
  } else {
    fillEl.style.width = '0%';
    pctEl.textContent  = 'Sin objetivo definido';
    goalEl.textContent = '';
  }

  renderCategoryChart();
  renderInvestmentChart();
  renderTrendChart();
}

function calcGoalEuros(settings, refIncome) {
  if (!settings.goalValue) return 0;
  return settings.goalType === 'percent'
    ? (refIncome * settings.goalValue / 100)
    : settings.goalValue;
}

// =====================================================================
// RENDER: DONUT — GASTOS
// =====================================================================
function renderCategoryChart() {
  const allCats  = getAllCategories();
  const catExp   = expenseByCategory();
  const total    = Object.values(catExp).reduce((s, v) => s + v, 0);
  const entries  = Object.entries(catExp).sort((a, b) => b[1] - a[1]);

  document.getElementById('donutTotal').textContent = fmtEuro(total);

  if (charts.category) { charts.category.destroy(); charts.category = null; }

  const ctx = document.getElementById('categoryChart').getContext('2d');

  if (entries.length === 0) {
    charts.category = new Chart(ctx, {
      type: 'doughnut',
      data: { datasets: [{ data: [1], backgroundColor: ['rgba(255,255,255,0.05)'], borderWidth: 0 }] },
      options: { cutout: '72%', plugins: { legend: { display: false }, tooltip: { enabled: false } } },
    });
    document.getElementById('categoryLegend').innerHTML =
      '<p style="color:var(--muted);font-size:0.78rem;text-align:center;padding:0.5rem 0">Sin gastos este mes</p>';
    return;
  }

  charts.category = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: entries.map(([k]) => allCats[k] ? allCats[k].label : k),
      datasets: [{
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map(([k]) => allCats[k] ? allCats[k].color : '#607d8b'),
        borderWidth: 2,
        borderColor: '#080810',
        hoverBorderWidth: 3,
      }],
    },
    options: {
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${fmtEuro(ctx.parsed)} (${Math.round(ctx.parsed / total * 100)}%)` } },
      },
    },
  });

  document.getElementById('categoryLegend').innerHTML = entries.slice(0, 5).map(([k, v]) => {
    const cat = allCats[k] || CATEGORIES.otros;
    return `
      <div class="legend-item">
        <div class="legend-dot" style="background:${cat.color}"></div>
        <span class="legend-label">${cat.emoji} ${cat.label}</span>
        <span class="legend-amount">${fmtEuro(v)}</span>
        <span class="legend-pct">${Math.round(v / total * 100)}%</span>
      </div>`;
  }).join('');
}

// =====================================================================
// RENDER: DONUT — INVERSIONES
// =====================================================================
function renderInvestmentChart() {
  const allInvCats = getAllCategoriesForType('investment');
  const catInv  = investmentByCategory();
  const total   = Object.values(catInv).reduce((s, v) => s + v, 0);
  const entries = Object.entries(catInv).sort((a, b) => b[1] - a[1]);
  const card    = document.getElementById('investmentChartCard');

  if (total === 0) {
    card.style.display = 'none';
    if (charts.investment) { charts.investment.destroy(); charts.investment = null; }
    return;
  }

  card.style.display = '';
  document.getElementById('investmentTotal').textContent = fmtEuro(total);

  if (charts.investment) { charts.investment.destroy(); charts.investment = null; }

  const ctx = document.getElementById('investmentChart').getContext('2d');
  charts.investment = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: entries.map(([k]) => (allInvCats[k] || {}).label || k),
      datasets: [{
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map(([k]) => (allInvCats[k] || {}).color || '#607d8b'),
        borderWidth: 2,
        borderColor: '#080810',
        hoverBorderWidth: 3,
      }],
    },
    options: {
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${fmtEuro(ctx.parsed)} (${Math.round(ctx.parsed / total * 100)}%)` } },
      },
    },
  });

  document.getElementById('investmentLegend').innerHTML = entries.map(([k, v]) => {
    const cat = allInvCats[k] || { emoji: '💼', label: k, color: '#607d8b' };
    return `
      <div class="legend-item">
        <div class="legend-dot" style="background:${cat.color}"></div>
        <span class="legend-label">${cat.emoji} ${cat.label}</span>
        <span class="legend-amount">${fmtEuro(v)}</span>
        <span class="legend-pct">${Math.round(v / total * 100)}%</span>
      </div>`;
  }).join('');
}

// =====================================================================
// RENDER: DAILY CHART
// =====================================================================
function renderTrendChart() {
  const [y, m]   = state.currentMonth.split('-').map(Number);
  const today    = new Date();
  const isCurrentMonth = (y === today.getFullYear() && m === today.getMonth() + 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const lastDay  = isCurrentMonth ? today.getDate() : daysInMonth;

  const labels  = [];
  const expData = [];
  const incData = [];

  const allTxs = DB.getTransactions().filter(tx => tx.date.startsWith(state.currentMonth));

  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${state.currentMonth}-${String(d).padStart(2, '0')}`;
    const dayTxs  = allTxs.filter(tx => tx.date === dateStr);
    labels.push(d);
    expData.push(sum(dayTxs.filter(t => t.type === 'expense' || t.type === 'savings' || t.type === 'investment')));
    incData.push(sum(dayTxs.filter(t => t.type === 'income')));
  }

  if (charts.trend) { charts.trend.destroy(); charts.trend = null; }

  const ctx = document.getElementById('trendChart').getContext('2d');
  charts.trend = new Chart(ctx, {
    data: {
      labels,
      datasets: [
        {
          type: 'bar', label: 'Salidas', data: expData,
          backgroundColor: 'rgba(255,61,113,0.65)', borderRadius: 4, maxBarThickness: 18, order: 2,
        },
        {
          type: 'line', label: 'Ingresos', data: incData,
          borderColor: 'rgba(0,200,83,0.85)', backgroundColor: 'rgba(0,200,83,0.08)',
          borderWidth: 2, pointRadius: 3, pointBackgroundColor: 'rgba(0,200,83,0.9)',
          tension: 0.3, fill: true, order: 1,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { color: '#7878a0', font: { family: 'Outfit', size: 11 }, boxWidth: 10, padding: 14 } },
        tooltip: { callbacks: { title: items => `Día ${items[0].label}`, label: ctx => ` ${ctx.dataset.label}: ${fmtEuro(ctx.parsed.y)}` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#7878a0', font: { family: 'Outfit', size: 10 }, maxTicksLimit: 12 } },
        y: { min: 0, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#7878a0', font: { family: 'Outfit', size: 10 }, callback: v => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v } },
      },
    },
  });
}

// =====================================================================
// RENDER: TRANSACTIONS
// =====================================================================
function renderTransactions() {
  const txs    = getTxs().sort((a, b) => new Date(b.date) - new Date(a.date));
  const listEl = document.getElementById('transactionsList');
  const empEl  = document.getElementById('emptyTransactions');

  if (txs.length === 0) {
    listEl.innerHTML = '';
    empEl.classList.remove('hidden');
    return;
  }

  empEl.classList.add('hidden');

  const groups = {};
  txs.forEach(tx => {
    if (!groups[tx.date]) groups[tx.date] = [];
    groups[tx.date].push(tx);
  });

  listEl.innerHTML = Object.entries(groups).map(([date, items]) => `
    <div class="tx-day-group">
      <div class="tx-day-header">${fmtDate(date)}</div>
      ${items.map(tx => {
        const cat  = getCategoryForTransaction(tx);
        const sign = tx.type === 'income' ? '+' : '-';
        const lockBadge = tx.type === 'savings' ? '<span class="tx-lock">🔒</span>' : '';
        return `
          <div class="tx-item" data-id="${tx.id}">
            <div class="tx-cat-icon" style="background:${cat.color}1a"><span>${cat.emoji}</span></div>
            <div class="tx-info">
              <div class="tx-desc">${tx.description || cat.label}</div>
              <div class="tx-cat-label">${cat.label}</div>
            </div>
            <div class="tx-amount ${tx.type}">${sign}${fmtEuro(tx.amount)}${lockBadge}</div>
          </div>`;
      }).join('')}
    </div>`
  ).join('');

  listEl.querySelectorAll('.tx-item').forEach(el => {
    el.addEventListener('click', () => {
      state.deleteId = el.dataset.id;
      document.getElementById('deleteModal').classList.remove('hidden');
    });
  });
}

// =====================================================================
// RENDER: OBJETIVOS
// =====================================================================
function renderObjetivos() {
  const settings = DB.getSettings();

  document.getElementById('savingsGoalInput').value = settings.goalValue || '';
  document.getElementById('goalSuffix').textContent = settings.goalType === 'percent' ? '%' : '€';

  document.querySelectorAll('.goal-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.gtype === (settings.goalType || 'amount'));
  });

  document.getElementById('budgetInputs').innerHTML = Object.entries(getAllCategories()).map(([k, cat]) => `
    <div class="budget-input-row">
      <div class="budget-cat-label">${cat.emoji} ${cat.label}</div>
      <input type="number" class="budget-input-field" data-cat="${k}"
             placeholder="0" min="0"
             value="${settings.budgets && settings.budgets[k] ? settings.budgets[k] : ''}">
      <span class="budget-currency">€</span>
    </div>`
  ).join('');

  renderBudgetProgress(settings);
  renderCustomCats();
}

function renderBudgetProgress(settings) {
  const budgets = settings.budgets || {};
  const catExp  = expenseByCategory();
  const el      = document.getElementById('budgetProgress');

  const entries = Object.entries(getAllCategories()).filter(([k]) => budgets[k] > 0 || catExp[k] > 0);

  if (entries.length === 0) {
    el.innerHTML = '<p style="color:var(--muted);font-size:0.78rem">Configura presupuestos arriba para ver el progreso aqui.</p>';
    return;
  }

  el.innerHTML = entries.map(([k, cat]) => {
    const spent  = catExp[k] || 0;
    const budget = budgets[k] || 0;
    const pct    = budget > 0 ? Math.min(100, (spent / budget) * 100) : null;
    const color  = pct === null ? cat.color : pct > 100 ? 'var(--red)' : pct > 78 ? 'var(--orange)' : cat.color;

    return `
      <div class="budget-progress-item">
        <div class="budget-progress-header">
          <div class="budget-progress-label">${cat.emoji} ${cat.label}</div>
          <div class="budget-progress-values">
            ${fmtEuro(spent)}${budget > 0 ? ` / ${fmtEuro(budget)}` : ''}
            ${pct !== null ? `<span style="color:${color};margin-left:4px">(${Math.round(pct)}%)</span>` : ''}
          </div>
        </div>
        ${budget > 0 ? `<div class="budget-bar"><div class="budget-bar-fill" style="width:${pct}%;background:${color}"></div></div>` : ''}
      </div>`;
  }).join('');
}

// =====================================================================
// RENDER: CONSEJOS
// =====================================================================
function renderConsejos() {
  const advice = generateAdvice();
  document.getElementById('adviceList').innerHTML = advice.map(a => `
    <div class="advice-card tipo-${a.type}">
      <div class="advice-icon">${a.icon}</div>
      <div>
        <div class="advice-title">${a.title}</div>
        <div class="advice-body">${a.body}</div>
      </div>
    </div>`
  ).join('');
}

// =====================================================================
// ADVICE ENGINE
// =====================================================================
function generateAdvice() {
  const advice      = [];
  const allCats     = getAllCategories();
  const settings    = DB.getSettings();
  const totalExpense    = sum(getExpenses());
  const totalIncome     = sum(getIncomes());
  const totalSavingsT   = sum(getSavingsType());
  const totalInvestment = sum(getInvestments());
  const refIncome   = totalIncome || settings.refIncome || 0;
  const goalEuros   = calcGoalEuros(settings, refIncome);
  const budgets     = settings.budgets || {};
  const catExp      = expenseByCategory();
  const margenLibre = totalIncome - totalExpense - totalSavingsT - totalInvestment;

  if (goalEuros > 0 && refIncome > 0) {
    const pct = Math.round(totalSavingsT / goalEuros * 100);
    if (totalSavingsT >= goalEuros) {
      advice.push({ type: 'logro', icon: '🏆', title: '¡Objetivo de ahorro superado!', body: `Has bloqueado ${fmtEuro(totalSavingsT)} este mes, superando tu meta de ${fmtEuro(goalEuros)}. ¡Excelente disciplina financiera!` });
    } else if (totalSavingsT > 0) {
      advice.push({ type: 'objetivo', icon: '🎯', title: 'Avanzando hacia tu objetivo', body: `Llevas ${fmtEuro(totalSavingsT)} bloqueados como ahorro (${pct}%). Te faltan ${fmtEuro(goalEuros - totalSavingsT)} para alcanzar tu meta de ${fmtEuro(goalEuros)}.` });
    } else if (totalExpense > 0) {
      advice.push({ type: 'alerta', icon: '⚠️', title: 'Sin ahorro registrado este mes', body: `Aún no has registrado ningún movimiento de tipo Ahorro. Pulsa + y selecciona 🏦 Ahorro para bloquear dinero hacia tu objetivo de ${fmtEuro(goalEuros)}.` });
    }
  }

  if (refIncome > 0 && totalExpense > 0) {
    const ratio = totalExpense / refIncome;
    if (ratio > 0.93) {
      advice.push({ type: 'alerta', icon: '🚨', title: 'Gastas casi todo lo que ingresas', body: `Tus gastos son el ${Math.round(ratio * 100)}% de tus ingresos. Lo recomendable es no superar el 80% para mantener un colchon de emergencia.` });
    } else if (ratio < 0.55) {
      advice.push({ type: 'logro', icon: '🌟', title: 'Ratio de gasto excelente', body: `Solo gastas el ${Math.round(ratio * 100)}% de tus ingresos. Margen libre este mes: ${fmtEuro(Math.max(0, margenLibre))}. Considera bloquearlo como ahorro.` });
    }
  }

  if (totalInvestment > 0 && refIncome > 0) {
    const invPct = Math.round(totalInvestment / refIncome * 100);
    advice.push({ type: 'objetivo', icon: '📈', title: `Invirtiendo el ${invPct}% de tus ingresos`, body: `Este mes tienes ${fmtEuro(totalInvestment)} en inversiones. Un buen ritmo inversor a largo plazo suele estar entre el 10-20% de los ingresos.` });
  }

  const overBudget = Object.entries(catExp).filter(([k, v]) => budgets[k] > 0 && v > budgets[k]).sort((a, b) => (b[1] - budgets[b[0]]) - (a[1] - budgets[a[0]]));
  if (overBudget.length > 0) {
    const [k, spent] = overBudget[0];
    const cat = allCats[k] || CATEGORIES.otros;
    advice.push({ type: 'alerta', icon: '📊', title: `Sobrepresupuesto en ${cat.label}`, body: `Has gastado ${fmtEuro(spent)} en ${cat.emoji} ${cat.label}, ${fmtEuro(spent - budgets[k])} por encima de tu limite de ${fmtEuro(budgets[k])}.` });
  }

  const nearLimit = Object.entries(catExp).filter(([k, v]) => budgets[k] > 0 && v >= budgets[k] * 0.8 && v < budgets[k]).sort((a, b) => b[1] / budgets[b[0]] - a[1] / budgets[a[0]]);
  if (nearLimit.length > 0) {
    const [k, spent] = nearLimit[0];
    const cat = allCats[k] || CATEGORIES.otros;
    advice.push({ type: 'objetivo', icon: '⚡', title: `Presupuesto de ${cat.label} casi agotado`, body: `Has consumido el ${Math.round(spent / budgets[k] * 100)}% de tu presupuesto en ${cat.emoji} ${cat.label}. Solo te quedan ${fmtEuro(budgets[k] - spent)} hasta fin de mes.` });
  }

  const prevM   = prevMonth(state.currentMonth);
  const prevExp = sum(getExpenses(prevM));
  if (prevExp > 0 && totalExpense > 0) {
    const diff = totalExpense - prevExp;
    const diffPct = Math.round(diff / prevExp * 100);
    if (diff > 0 && diffPct > 12) {
      advice.push({ type: 'alerta', icon: '📈', title: 'El gasto subio respecto al mes pasado', body: `Llevas ${fmtEuro(diff)} mas en gastos (+${diffPct}%) que el mes anterior.` });
    } else if (diff < 0 && Math.abs(diffPct) > 10) {
      advice.push({ type: 'logro', icon: '📉', title: 'Gasto reducido vs mes anterior', body: `¡Muy bien! Este mes gastas ${fmtEuro(Math.abs(diff))} menos (${diffPct}%) que el mes pasado.` });
    }
  }

  const topCat = Object.entries(catExp).sort((a, b) => b[1] - a[1])[0];
  if (topCat && totalExpense > 0) {
    const [k, v] = topCat;
    const cat = allCats[k] || CATEGORIES.otros;
    const pct = Math.round(v / totalExpense * 100);
    if (pct > 40 && k !== 'vivienda') {
      advice.push({ type: 'sugerencia', icon: '💡', title: `${cat.label} representa el ${pct}% de tus gastos`, body: `Reducir un 20% en ${cat.emoji} ${cat.label} te ahorraría ${fmtEuro(v * 0.2)} adicionales al mes.` });
    }
  }

  if (totalExpense === 0 && totalIncome === 0) {
    advice.push({ type: 'sugerencia', icon: '🚀', title: 'Empieza a registrar hoy', body: 'Añade tus ingresos, gastos, ahorro e inversiones para recibir consejos personalizados.' });
  }
  if (!goalEuros) {
    advice.push({ type: 'sugerencia', icon: '🎯', title: 'Define tu objetivo de ahorro', body: 'Sin una meta clara, es dificil medir el progreso. Ve a Objetivos y fija cuanto quieres ahorrar este mes.' });
  }
  if (Object.values(budgets).every(v => !v)) {
    advice.push({ type: 'sugerencia', icon: '📊', title: 'Configura presupuestos por categoria', body: 'Poner un limite mensual a cada categoria de gasto es la tecnica mas eficaz para controlar el gasto.' });
  }

  return advice;
}

// =====================================================================
// CUSTOM CATEGORIES
// =====================================================================
const CAT_TYPE_LABELS = {
  expense:    '💸 Gastos',
  income:     '💰 Ingresos',
  savings:    '🏦 Ahorro',
  investment: '📈 Inversión',
};

function renderCustomCats() {
  const type = state.customCatTab;
  const cats = DB.getCustomCategoriesForType(type);
  const el   = document.getElementById('customCatList');
  if (!el) return;

  // Update tab active state
  document.querySelectorAll('.cat-type-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cattype === type);
  });

  if (cats.length === 0) {
    el.innerHTML = `<p style="color:var(--muted);font-size:0.75rem;padding:0.3rem 0">Sin categorías personalizadas para ${CAT_TYPE_LABELS[type]}.</p>`;
    return;
  }

  el.innerHTML = cats.map(cat => `
    <div class="custom-cat-item">
      <div class="custom-cat-icon" style="background:${cat.color}1a">${cat.emoji}</div>
      <span class="custom-cat-name" style="color:${cat.color}">${cat.label}</span>
      <button class="custom-cat-delete" data-id="${cat.id}" data-cattype="${type}">✕</button>
    </div>`
  ).join('');

  el.querySelectorAll('.custom-cat-delete').forEach(btn => {
    btn.addEventListener('click', () => deleteCat(btn.dataset.id, btn.dataset.cattype));
  });
}

function openCatModal(forType) {
  state.catModalType = forType || state.txType;
  state.catEmoji = '📦';
  state.catColor = '#7c4dff';
  document.getElementById('catNameInput').value   = '';
  document.getElementById('catPreviewIcon').textContent      = '📦';
  document.getElementById('catPreviewIcon').style.background = '#7c4dff1a';

  document.getElementById('emojiPicker').innerHTML = CAT_EMOJIS.map(e => `
    <button class="emoji-btn${e === state.catEmoji ? ' selected' : ''}" data-emoji="${e}">${e}</button>`
  ).join('');
  document.getElementById('emojiPicker').querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.catEmoji = btn.dataset.emoji;
      document.getElementById('emojiPicker').querySelectorAll('.emoji-btn')
        .forEach(b => b.classList.toggle('selected', b.dataset.emoji === state.catEmoji));
      document.getElementById('catPreviewIcon').textContent = state.catEmoji;
    });
  });

  document.getElementById('colorPalette').innerHTML =
    CAT_COLORS.map(c => `<button class="color-swatch${c === state.catColor ? ' selected' : ''}" data-color="${c}" style="background:${c}"></button>`).join('') +
    `<input type="color" id="customColorPicker" class="color-custom-input" value="${state.catColor}">`;

  document.getElementById('colorPalette').querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      state.catColor = btn.dataset.color;
      document.getElementById('colorPalette').querySelectorAll('.color-swatch')
        .forEach(b => b.classList.toggle('selected', b.dataset.color === state.catColor));
      document.getElementById('catPreviewIcon').style.background = state.catColor + '1a';
    });
  });

  document.getElementById('colorPalette').addEventListener('change', e => {
    if (e.target.id === 'customColorPicker') {
      state.catColor = e.target.value;
      document.getElementById('colorPalette').querySelectorAll('.color-swatch').forEach(b => b.classList.remove('selected'));
      document.getElementById('catPreviewIcon').style.background = state.catColor + '1a';
    }
  });

  document.getElementById('catModal').classList.remove('hidden');
  setTimeout(() => document.getElementById('catNameInput').focus(), 320);
}

function saveCat() {
  const name = document.getElementById('catNameInput').value.trim();
  if (!name) {
    const input = document.getElementById('catNameInput');
    input.style.animation = 'shake 0.3s ease';
    setTimeout(() => input.style.animation = '', 400);
    input.focus();
    return;
  }

  const type = state.catModalType;
  const cats = DB.getCustomCategoriesForType(type);
  const newCat = {
    id:    'c_' + Date.now().toString(36),
    label: name,
    emoji: state.catEmoji,
    color: state.catColor,
  };
  cats.push(newCat);
  DB.saveCustomCategoriesForType(type, cats);
  document.getElementById('catModal').classList.add('hidden');
  showToast('Categoría creada');

  if (state.catModalSource === 'addTx') {
    state.catModalSource = null;
    state.selectedCat = newCat.id;
    buildCatGrid();
  } else {
    renderCustomCats();
  }
}

function deleteCat(id, type) {
  type = type || state.customCatTab;
  DB.saveCustomCategoriesForType(type, DB.getCustomCategoriesForType(type).filter(c => c.id !== id));
  renderCustomCats();
  showToast('Categoría eliminada');
}

// =====================================================================
// MODAL: ADD TRANSACTION
// =====================================================================
function openAddModal() {
  state.selectedCat = null;
  state.txType      = 'expense';

  document.getElementById('amountInput').value = '';
  document.getElementById('descInput').value   = '';
  document.getElementById('dateInput').value   = new Date().toISOString().split('T')[0];

  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === 'expense');
  });

  buildCatGrid();
  document.getElementById('addModal').classList.remove('hidden');
  setTimeout(() => document.getElementById('amountInput').focus(), 320);
}

function buildCatGrid() {
  const grid = document.getElementById('catGrid');
  const type = state.txType;
  const allCats = getAllCategoriesForType(type);

  state.selectedCat = null;

  grid.innerHTML = Object.entries(allCats).map(([k, cat]) => `
    <button class="cat-btn" data-cat="${k}">
      <span class="cat-emoji">${cat.emoji}</span>
      <span class="cat-label">${cat.label}</span>
    </button>`
  ).join('') + `
    <button class="cat-btn cat-btn-new" id="catGridNewBtn">
      <span class="cat-emoji">+</span>
      <span class="cat-label">Nueva</span>
    </button>`;

  grid.querySelectorAll('.cat-btn:not(.cat-btn-new)').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedCat = btn.dataset.cat;
      grid.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  document.getElementById('catGridNewBtn').addEventListener('click', () => {
    state.catModalSource = 'addTx';
    openCatModal(type);
  });
}

function saveTransaction() {
  const amountEl = document.getElementById('amountInput');
  const amount   = parseFloat(amountEl.value);

  if (!amount || amount <= 0) {
    amountEl.style.animation = 'shake 0.3s ease';
    setTimeout(() => amountEl.style.animation = '', 400);
    amountEl.focus();
    return;
  }

  if (!state.selectedCat) {
    const grid = document.getElementById('catGrid');
    grid.style.animation = 'shake 0.3s ease';
    setTimeout(() => grid.style.animation = '', 400);
    return;
  }

  DB.addTransaction({
    type:        state.txType,
    amount,
    category:    state.selectedCat,
    description: document.getElementById('descInput').value.trim(),
    date:        document.getElementById('dateInput').value,
  });

  document.getElementById('addModal').classList.add('hidden');
  showToast('Transaccion guardada');
  refreshView();
}

// =====================================================================
// EXPORT TO EXCEL
// =====================================================================
function exportToExcel() {
  const txs = DB.getTransactions().sort((a, b) => new Date(b.date) - new Date(a.date));

  if (txs.length === 0) {
    showToast('Sin transacciones para exportar');
    return;
  }

  const typeLabel = { expense: 'Gasto', income: 'Ingreso', savings: 'Ahorro', investment: 'Inversión' };

  const rows = txs.map(tx => {
    const cat  = getCategoryForTransaction(tx);
    const sign = tx.type === 'income' ? 1 : -1;
    return {
      'Fecha':        tx.date,
      'Tipo':         typeLabel[tx.type] || tx.type,
      'Categoría':    cat.label,
      'Descripción':  tx.description || '',
      'Importe (€)':  sign * tx.amount,
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 30 }, { wch: 14 }];

  const wb   = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');

  const today = new Date().toISOString().split('T')[0];
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob  = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement('a');
  a.href = url; a.download = `fintrack_${today}.xlsx`;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 1000);
  showToast('Excel descargado');
}

// =====================================================================
// NAVIGATION
// =====================================================================
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });
  state.activeView = viewId;
  document.getElementById(`view-${viewId}`).classList.add('active');
  refreshView();
}

function refreshView() {
  switch (state.activeView) {
    case 'dashboard': renderDashboard();    break;
    case 'gastos':    renderTransactions(); break;
    case 'objetivos': renderObjetivos();    break;
    case 'consejos':  renderConsejos();     break;
  }
}

// =====================================================================
// TOAST
// =====================================================================
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = [
    'position:fixed', 'bottom:84px', 'left:50%', 'transform:translateX(-50%)',
    'background:rgba(124,77,255,0.88)', 'color:#fff', 'padding:0.5rem 1.2rem',
    'border-radius:100px', 'font-family:Outfit,sans-serif', 'font-size:0.84rem',
    'font-weight:500', 'z-index:200', 'backdrop-filter:blur(10px)',
    'animation:fadeInUp 0.25s ease, fadeOut 0.3s ease 1.5s forwards', 'white-space:nowrap',
  ].join(';');
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

// =====================================================================
// INIT
// =====================================================================
function init() {
  document.getElementById('prevMonthBtn').addEventListener('click', () => {
    state.currentMonth = prevMonth(state.currentMonth);
    document.getElementById('monthDisplay').textContent = fmtMonth(state.currentMonth);
    refreshView();
  });

  document.getElementById('nextMonthBtn').addEventListener('click', () => {
    state.currentMonth = nextMonth(state.currentMonth);
    document.getElementById('monthDisplay').textContent = fmtMonth(state.currentMonth);
    refreshView();
  });

  document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.getElementById('addFab').addEventListener('click', openAddModal);

  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('addModal').classList.add('hidden');
  });
  document.getElementById('addModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) document.getElementById('addModal').classList.add('hidden');
  });

  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.txType = btn.dataset.type;
      document.querySelectorAll('.type-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.type === btn.dataset.type);
      });
      buildCatGrid();
    });
  });

  document.getElementById('saveBtn').addEventListener('click', saveTransaction);
  document.getElementById('amountInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveTransaction();
  });

  document.getElementById('cancelDelete').addEventListener('click', () => {
    document.getElementById('deleteModal').classList.add('hidden');
    state.deleteId = null;
  });
  document.getElementById('confirmDelete').addEventListener('click', () => {
    if (state.deleteId) {
      DB.deleteTransaction(state.deleteId);
      state.deleteId = null;
      document.getElementById('deleteModal').classList.add('hidden');
      showToast('Transaccion eliminada');
      refreshView();
    }
  });

  document.getElementById('balanceEditBtn').addEventListener('click', () => {
    const s = DB.getSettings();
    document.getElementById('baseBalanceInput').value = s.baseBalance || '';
    document.getElementById('balanceEditCard').classList.remove('hidden');
  });
  document.getElementById('cancelBalance').addEventListener('click', () => {
    document.getElementById('balanceEditCard').classList.add('hidden');
  });
  document.getElementById('saveBalance').addEventListener('click', () => {
    const s = DB.getSettings();
    s.baseBalance = parseFloat(document.getElementById('baseBalanceInput').value) || 0;
    DB.saveSettings(s);
    document.getElementById('balanceEditCard').classList.add('hidden');
    showToast('Saldo base guardado');
    renderDashboard();
  });

  document.getElementById('saveGoal').addEventListener('click', () => {
    const s = DB.getSettings();
    s.goalValue = parseFloat(document.getElementById('savingsGoalInput').value) || 0;
    DB.saveSettings(s);
    renderBudgetProgress(s);
    showToast('Objetivo de ahorro guardado');
    if (state.activeView === 'dashboard') renderDashboard();
  });

  document.querySelectorAll('.goal-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.goal-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const s = DB.getSettings();
      s.goalType = btn.dataset.gtype;
      DB.saveSettings(s);
      document.getElementById('goalSuffix').textContent = s.goalType === 'percent' ? '%' : '€';
    });
  });

  document.getElementById('saveBudgets').addEventListener('click', () => {
    const s = DB.getSettings();
    s.budgets = {};
    document.querySelectorAll('.budget-input-field').forEach(input => {
      const v = parseFloat(input.value) || 0;
      if (v > 0) s.budgets[input.dataset.cat] = v;
    });
    DB.saveSettings(s);
    renderBudgetProgress(s);
    showToast('Presupuestos guardados');
  });

  // Custom categories section tabs
  document.querySelectorAll('.cat-type-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.customCatTab = btn.dataset.cattype;
      renderCustomCats();
    });
  });

  document.getElementById('newCatBtn').addEventListener('click', () => openCatModal(state.customCatTab));
  document.getElementById('closeCatModal').addEventListener('click', () => {
    document.getElementById('catModal').classList.add('hidden');
  });
  document.getElementById('catModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) document.getElementById('catModal').classList.add('hidden');
  });
  document.getElementById('saveCatBtn').addEventListener('click', saveCat);

  document.getElementById('exportBtn').addEventListener('click', exportToExcel);

  // Savings mode toggle
  document.querySelectorAll('.smode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = DB.getSettings();
      s.savingsMode = btn.dataset.smode;
      DB.saveSettings(s);
      renderDashboard();
    });
  });

  document.getElementById('monthDisplay').textContent = fmtMonth(state.currentMonth);
  renderDashboard();
}

document.addEventListener('DOMContentLoaded', init);
