// Personal Expense Manager - Application Logic

// ==================== Constants ====================
const STORAGE_KEY = 'pem_tx_v1';
const TRASH_KEY = 'pem_trash_v1';
const THEME_KEY = 'pem_theme';
const ONBOARDING_KEY = 'pem_onboarding_done';
const TRASH_RETENTION_DAYS = 7;

// ==================== State ====================
let transactions = [];
let trash = [];
let lineChart = null;
let pieChart = null;
let sparklineChart = null;
let selectedTrashIds = new Set();

// ==================== Category Colors ====================
const categoryColors = {
    'Food': '#f59e0b',
    'Transport': '#3b82f6',
    'Shopping': '#ec4899',
    'Bills': '#8b5cf6',
    'Entertainment': '#10b981',
    'Health': '#ef4444',
    'Education': '#06b6d4',
    'General': '#6366f1'
};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadTransactions();
    loadTrash();
    cleanExpiredTrash();
    checkOnboarding();
    setDefaultDate();
    renderTransactions();
    renderTrash();
    updateStats();
    initCharts();
    setupEventListeners();
    updateTrashBadge();
});

// ==================== Theme Management ====================
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(theme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (theme === 'dark') {
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
    } else {
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>';
    }
}

// ==================== Onboarding ====================
function checkOnboarding() {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (done) {
        document.getElementById('onboarding').classList.add('hidden');
    }
}

function startTracking() {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    document.getElementById('onboarding').classList.add('hidden');
    document.getElementById('amount').focus();
}

function startTour() {
    startTracking();
    showToast('Welcome! Start by adding your first expense above.', 'success');
}

// ==================== Storage ====================
function loadTransactions() {
    const data = localStorage.getItem(STORAGE_KEY);
    transactions = data ? JSON.parse(data) : [];
}

function saveTransactions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadTrash() {
    const data = localStorage.getItem(TRASH_KEY);
    trash = data ? JSON.parse(data) : [];
}

function saveTrash() {
    localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// ==================== Trash Management ====================
function cleanExpiredTrash() {
    const now = Date.now();
    const expiryMs = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const originalLength = trash.length;
    trash = trash.filter(item => (now - item.deletedAt) < expiryMs);
    if (trash.length !== originalLength) {
        saveTrash();
    }
}

function moveToTrash(id) {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        const item = transactions[index];
        item.deletedAt = Date.now();
        trash.push(item);
        transactions.splice(index, 1);
        saveTransactions();
        saveTrash();
        renderTransactions();
        renderTrash();
        updateStats();
        updateCharts();
        updateTrashBadge();
        showToast('Moved to trash. Will be permanently deleted in 7 days.', 'success');
    }
}

function restoreFromTrash(id) {
    const index = trash.findIndex(t => t.id === id);
    if (index !== -1) {
        const item = trash[index];
        delete item.deletedAt;
        transactions.unshift(item);
        trash.splice(index, 1);
        saveTransactions();
        saveTrash();
        renderTransactions();
        renderTrash();
        updateStats();
        updateCharts();
        updateTrashBadge();
        showToast('Transaction restored!', 'success');
    }
}

function permanentlyDelete(id) {
    trash = trash.filter(t => t.id !== id);
    saveTrash();
    renderTrash();
    updateTrashBadge();
    showToast('Permanently deleted.', 'success');
}

function getTrashExpiryText(deletedAt) {
    const now = Date.now();
    const expiryMs = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const remaining = expiryMs - (now - deletedAt);
    const days = Math.ceil(remaining / (24 * 60 * 60 * 1000));
    if (days <= 0) return 'Expiring soon';
    if (days === 1) return 'Expires in 1 day';
    return `Expires in ${days} days`;
}

function updateTrashBadge() {
    const badge = document.getElementById('trashBadge');
    if (trash.length > 0) {
        badge.textContent = trash.length;
        badge.style.display = 'inline';
    } else {
        badge.style.display = 'none';
    }
}

// ==================== Bulk Trash Operations ====================
function toggleTrashSelection(id, checked) {
    if (checked) {
        selectedTrashIds.add(id);
    } else {
        selectedTrashIds.delete(id);
    }
    updateBulkActionsVisibility();
}

function selectAllTrash() {
    const checkboxes = document.querySelectorAll('.trash-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = true;
        selectedTrashIds.add(cb.dataset.id);
    });
    updateBulkActionsVisibility();
}

function deselectAllTrash() {
    const checkboxes = document.querySelectorAll('.trash-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = false;
    });
    selectedTrashIds.clear();
    updateBulkActionsVisibility();
}

function updateBulkActionsVisibility() {
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');
    if (selectedTrashIds.size > 0) {
        bulkActions.classList.remove('hidden');
        selectedCount.textContent = `${selectedTrashIds.size} selected`;
    } else {
        bulkActions.classList.add('hidden');
    }
}

function restoreSelected() {
    selectedTrashIds.forEach(id => {
        const index = trash.findIndex(t => t.id === id);
        if (index !== -1) {
            const item = trash[index];
            delete item.deletedAt;
            transactions.unshift(item);
            trash.splice(index, 1);
        }
    });
    selectedTrashIds.clear();
    saveTransactions();
    saveTrash();
    renderTransactions();
    renderTrash();
    updateStats();
    updateCharts();
    updateTrashBadge();
    updateBulkActionsVisibility();
    showToast('Selected items restored!', 'success');
}

function deleteSelected() {
    selectedTrashIds.forEach(id => {
        trash = trash.filter(t => t.id !== id);
    });
    selectedTrashIds.clear();
    saveTrash();
    renderTrash();
    updateTrashBadge();
    updateBulkActionsVisibility();
    showToast('Selected items permanently deleted.', 'success');
}

function emptyTrash() {
    if (trash.length === 0) return;
    document.getElementById('emptyTrashModal').classList.add('active');
}

function confirmEmptyTrash() {
    trash = [];
    selectedTrashIds.clear();
    saveTrash();
    renderTrash();
    updateTrashBadge();
    updateBulkActionsVisibility();
    closeEmptyTrashModal();
    showToast('Trash emptied.', 'success');
}

function closeEmptyTrashModal() {
    document.getElementById('emptyTrashModal').classList.remove('active');
}

// ==================== Tab Management ====================
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabName + 'Tab');
    });
}

// ==================== Event Listeners ====================
function setupEventListeners() {
    // Add form
    document.getElementById('addForm').addEventListener('submit', handleAddTransaction);

    // Edit form
    document.getElementById('editForm').addEventListener('submit', handleEditTransaction);

    // Filters
    document.getElementById('searchInput').addEventListener('input', renderTransactions);
    document.getElementById('categoryFilter').addEventListener('change', renderTransactions);
    document.getElementById('dateFrom').addEventListener('change', renderTransactions);
    document.getElementById('dateTo').addEventListener('change', renderTransactions);

    // Quick filters
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => handleQuickFilter(btn));
    });

    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEditModal();
            closeDeleteModal();
            closeDeleteSingleModal();
            closeEmptyTrashModal();
        }
    });

    // Enter key in amount field
    document.getElementById('amount').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('addForm').dispatchEvent(new Event('submit'));
        }
    });
}

// ==================== Transaction CRUD ====================
function handleAddTransaction(e) {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const note = document.getElementById('note').value;
    const date = document.getElementById('date').value;

    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }

    const transaction = {
        id: Date.now().toString(),
        amount,
        category,
        note,
        date,
        createdAt: new Date().toISOString()
    };

    transactions.unshift(transaction);
    saveTransactions();
    renderTransactions();
    updateStats();
    updateCharts();

    // Reset form
    document.getElementById('addForm').reset();
    setDefaultDate();
    document.getElementById('amount').focus();

    showToast('Expense added successfully!', 'success');
}

function handleEditTransaction(e) {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const amount = parseFloat(document.getElementById('editAmount').value);
    const category = document.getElementById('editCategory').value;
    const note = document.getElementById('editNote').value;
    const date = document.getElementById('editDate').value;

    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = {
            ...transactions[index],
            amount,
            category,
            note,
            date
        };
        saveTransactions();
        renderTransactions();
        updateStats();
        updateCharts();
        closeEditModal();
        showToast('Transaction updated!', 'success');
    }
}

function handleQuickFilter(btn) {
    document.querySelectorAll('.quick-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    const today = new Date();
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');

    switch (filter) {
        case 'today':
            dateFrom.value = today.toISOString().split('T')[0];
            dateTo.value = today.toISOString().split('T')[0];
            break;
        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            dateFrom.value = weekAgo.toISOString().split('T')[0];
            dateTo.value = today.toISOString().split('T')[0];
            break;
        case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            dateFrom.value = monthStart.toISOString().split('T')[0];
            dateTo.value = today.toISOString().split('T')[0];
            break;
        default:
            dateFrom.value = '';
            dateTo.value = '';
    }

    renderTransactions();
}

// ==================== Rendering ====================
function getFilteredTransactions() {
    let filtered = [...transactions];

    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const fromDate = document.getElementById('dateFrom').value;
    const toDate = document.getElementById('dateTo').value;

    if (search) {
        filtered = filtered.filter(tx =>
            tx.note.toLowerCase().includes(search) ||
            tx.category.toLowerCase().includes(search)
        );
    }

    if (category !== 'All') {
        filtered = filtered.filter(tx => tx.category === category);
    }

    if (fromDate) {
        filtered = filtered.filter(tx => tx.date >= fromDate);
    }

    if (toDate) {
        filtered = filtered.filter(tx => tx.date <= toDate);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderTransactions() {
    const filtered = getFilteredTransactions();
    const list = document.getElementById('transactionList');

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p>No transactions yet — add your first expense above.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = filtered.map(tx => {
        const categoryClass = `category-${tx.category.toLowerCase()}`;
        const formattedDate = new Date(tx.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        return `
            <div class="transaction-item" data-id="${tx.id}">
                <div class="tx-left">
                    <div class="tx-top">
                        <span class="category-badge ${categoryClass}">${tx.category}</span>
                        <span class="tx-date">${formattedDate}</span>
                    </div>
                    <div class="tx-note">${tx.note || 'No note'}</div>
                </div>
                <div class="tx-right">
                    <span class="tx-amount">৳ ${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <div class="tx-actions">
                        <button class="btn btn-secondary btn-icon" onclick="openEditModal('${tx.id}')" title="Edit this transaction" aria-label="Edit">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button class="btn btn-danger btn-icon" onclick="showDeleteSingleModal('${tx.id}')" title="Move to trash" aria-label="Delete">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderTrash() {
    const list = document.getElementById('trashList');

    if (trash.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <p>Trash is empty.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = trash.map(tx => {
        const categoryClass = `category-${tx.category.toLowerCase()}`;
        const formattedDate = new Date(tx.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        const expiryText = getTrashExpiryText(tx.deletedAt);

        return `
            <div class="transaction-item" data-id="${tx.id}">
                <input type="checkbox" class="tx-checkbox trash-checkbox" data-id="${tx.id}" onchange="toggleTrashSelection('${tx.id}', this.checked)">
                <div class="tx-left">
                    <div class="tx-top">
                        <span class="category-badge ${categoryClass}">${tx.category}</span>
                        <span class="tx-date">${formattedDate}</span>
                    </div>
                    <div class="tx-note">${tx.note || 'No note'}</div>
                    <div class="tx-expires">⏳ ${expiryText}</div>
                </div>
                <div class="tx-right">
                    <span class="tx-amount">৳ ${tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <div class="tx-actions">
                        <button class="btn btn-success btn-icon" onclick="restoreFromTrash('${tx.id}')" title="Restore transaction" aria-label="Restore">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                        </button>
                        <button class="btn btn-danger btn-icon" onclick="permanentlyDelete('${tx.id}')" title="Delete permanently" aria-label="Delete permanently">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== Stats & Charts ====================
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.slice(0, 7);

    const todayTotal = transactions
        .filter(tx => tx.date === today)
        .reduce((sum, tx) => sum + tx.amount, 0);

    const monthTotal = transactions
        .filter(tx => tx.date.startsWith(currentMonth))
        .reduce((sum, tx) => sum + tx.amount, 0);

    document.getElementById('todayTotal').textContent = `৳ ${todayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('monthTotal').textContent = `৳ ${monthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function initCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
    };

    // Sparkline
    const sparklineCtx = document.getElementById('sparkline').getContext('2d');
    sparklineChart = new Chart(sparklineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ data: [], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0 }] },
        options: { ...chartOptions, scales: { x: { display: false }, y: { display: false } } }
    });

    // Line Chart
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    lineChart = new Chart(lineCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Spending', data: [], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.2)', borderWidth: 2, fill: true, tension: 0.4 }] },
        options: {
            ...chartOptions,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (ctx) => `৳ ${ctx.raw.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` } }
            },
            scales: {
                x: { grid: { color: 'rgba(100, 116, 139, 0.1)' }, ticks: { color: '#94a3b8' } },
                y: { grid: { color: 'rgba(100, 116, 139, 0.1)' }, ticks: { color: '#94a3b8', callback: (val) => '৳ ' + val } }
            }
        }
    });

    // Pie Chart
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: Object.values(categoryColors), borderWidth: 0 }] },
        options: {
            ...chartOptions,
            plugins: {
                legend: { position: 'right', labels: { color: '#94a3b8', padding: 15, usePointStyle: true } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((ctx.raw / total) * 100).toFixed(1);
                            return `${ctx.label} — ${percentage}% — ৳ ${ctx.raw.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                        }
                    }
                }
            }
        }
    });

    updateCharts();
}

function updateCharts() {
    const today = new Date();

    // Last 7 days for sparkline
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayTotal = transactions.filter(tx => tx.date === dateStr).reduce((sum, tx) => sum + tx.amount, 0);
        last7Days.push({ date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), amount: dayTotal });
    }

    sparklineChart.data.labels = last7Days.map(d => d.date);
    sparklineChart.data.datasets[0].data = last7Days.map(d => d.amount);
    sparklineChart.update();

    // Last 30 days for line chart
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayTotal = transactions.filter(tx => tx.date === dateStr).reduce((sum, tx) => sum + tx.amount, 0);
        last30Days.push({ date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), amount: dayTotal });
    }

    lineChart.data.labels = last30Days.map(d => d.date);
    lineChart.data.datasets[0].data = last30Days.map(d => d.amount);
    lineChart.update();

    // Category totals for pie chart
    const categoryTotals = {};
    transactions.forEach(tx => {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    pieChart.data.labels = sortedCategories.map(([cat]) => cat);
    pieChart.data.datasets[0].data = sortedCategories.map(([, amount]) => amount);
    pieChart.data.datasets[0].backgroundColor = sortedCategories.map(([cat]) => categoryColors[cat] || '#6366f1');
    pieChart.update();
}

// ==================== Modals ====================
function openEditModal(id) {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    document.getElementById('editId').value = tx.id;
    document.getElementById('editAmount').value = tx.amount;
    document.getElementById('editCategory').value = tx.category;
    document.getElementById('editNote').value = tx.note;
    document.getElementById('editDate').value = tx.date;

    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

function showDeleteAllModal() {
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

function deleteAllData() {
    transactions = [];
    trash = [];
    saveTransactions();
    saveTrash();
    renderTransactions();
    renderTrash();
    updateStats();
    updateCharts();
    updateTrashBadge();
    closeDeleteModal();
    showToast('All data deleted successfully', 'success');
}

function showDeleteSingleModal(id) {
    document.getElementById('deleteSingleId').value = id;
    document.getElementById('deleteSingleModal').classList.add('active');
}

function closeDeleteSingleModal() {
    document.getElementById('deleteSingleModal').classList.remove('active');
}

function confirmDeleteSingle() {
    const id = document.getElementById('deleteSingleId').value;
    const item = document.querySelector(`[data-id="${id}"]`);

    if (item) {
        item.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            moveToTrash(id);
            closeDeleteSingleModal();
        }, 300);
    }
}

// ==================== CSV Import/Export ====================
function exportCSV() {
    if (transactions.length === 0) {
        showToast('No transactions to export', 'error');
        return;
    }

    const headers = ['Date', 'Category', 'Amount', 'Note'];
    const rows = transactions.map(tx => [
        tx.date,
        tx.category,
        tx.amount,
        `"${(tx.note || '').replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('CSV exported successfully!', 'success');
}

function importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').slice(1);

        let imported = 0;
        lines.forEach(line => {
            if (!line.trim()) return;

            const match = line.match(/^([^,]+),([^,]+),([^,]+),(.*)$/);
            if (match) {
                const [, date, category, amount, note] = match;
                const parsedAmount = parseFloat(amount);

                if (!isNaN(parsedAmount) && date) {
                    transactions.push({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        date: date.trim(),
                        category: category.trim() || 'General',
                        amount: parsedAmount,
                        note: note.replace(/^"|"$/g, '').replace(/""/g, '"').trim(),
                        createdAt: new Date().toISOString()
                    });
                    imported++;
                }
            }
        });

        if (imported > 0) {
            saveTransactions();
            renderTransactions();
            updateStats();
            updateCharts();
            showToast(`Imported ${imported} transactions!`, 'success');
        } else {
            showToast('No valid transactions found in CSV', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ==================== Toast ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
