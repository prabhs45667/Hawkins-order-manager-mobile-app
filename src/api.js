/**
 * api.js — Frontend API layer for MongoDB cloud sync.
 * Communicates with the Express backend server.
 * All data changes are synced to MongoDB for permanent backup.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ---- Helpers ----

const apiCall = async (path, options = {}) => {
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
        return await res.json();
    } catch (err) {
        console.error(`API call failed [${path}]:`, err);
        throw err;
    }
};

// ---- Cloud Sync ----

/**
 * Upload full app state to MongoDB.
 * Called after any data modification.
 */
export const syncToCloud = async (data) => {
    return apiCall('/api/sync', {
        method: 'POST',
        body: JSON.stringify({
            clients: data.clients || [],
            customProducts: data.customProducts || [],
            mrpOverrides: data.mrpOverrides || {},
            customPdfNames: data.customPdfNames || []
        })
    });
};

/**
 * Download full app state from MongoDB.
 * Called on startup if local DB is empty.
 */
export const restoreFromCloud = async () => {
    const result = await apiCall('/api/restore');
    return result.data;
};

// ---- Bill Records (for daily sales tracking) ----

/**
 * Save a detailed bill record with line items.
 */
export const saveBillToCloud = async (billRecord) => {
    return apiCall('/api/bills', {
        method: 'POST',
        body: JSON.stringify(billRecord)
    });
};

/**
 * Save a pure Order record (Quote) separately from bills.
 */
export const saveOrderToCloud = async (orderRecord) => {
    return apiCall('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderRecord)
    });
};

/**
 * Fetch all bills (optionally by date).
 */
export const fetchBillsFromCloud = async (dateKey) => {
    const query = dateKey ? `?dateKey=${dateKey}` : '';
    const result = await apiCall(`/api/bills${query}`);
    return result.bills || [];
};

// ---- Daily Sales ----

/**
 * Fetch aggregated daily sales data.
 */
export const fetchDailySales = async () => {
    const result = await apiCall('/api/daily-sales');
    return result.dailySales || [];
};

// ---- Daily Notes ----

/**
 * Save a daily note.
 */
export const saveDailyNoteToCloud = async (dateKey, note) => {
    return apiCall('/api/daily-notes', {
        method: 'POST',
        body: JSON.stringify({ dateKey, note })
    });
};

/**
 * Fetch all daily notes.
 */
export const fetchDailyNotes = async () => {
    const result = await apiCall('/api/daily-notes');
    return result.notes || [];
};

// ---- Debounced Sync ----

let syncTimer = null;
let pendingData = null;
let syncListeners = [];

export const addSyncListener = (fn) => { syncListeners.push(fn); };
export const removeSyncListener = (fn) => { syncListeners = syncListeners.filter(l => l !== fn); };

const notifyListeners = (status) => {
    syncListeners.forEach(fn => {
        try { fn(status); } catch(e) { /* ignore */ }
    });
};

/**
 * Queue a sync operation. Debounced to 5 seconds.
 * Prevents excessive API calls when user makes rapid changes.
 */
export const queueSync = (data) => {
    pendingData = data;
    if (syncTimer) clearTimeout(syncTimer);
    notifyListeners('pending');

    syncTimer = setTimeout(async () => {
        if (!pendingData) return;
        try {
            notifyListeners('syncing');
            await syncToCloud(pendingData);
            pendingData = null;
            notifyListeners('synced');
        } catch (err) {
            console.error('Cloud sync failed:', err);
            notifyListeners('error');
        }
    }, 5000);
};

/**
 * Force immediate sync (e.g., before app closes).
 */
export const flushSync = async () => {
    if (syncTimer) clearTimeout(syncTimer);
    if (!pendingData) return;
    try {
        notifyListeners('syncing');
        await syncToCloud(pendingData);
        pendingData = null;
        notifyListeners('synced');
    } catch (err) {
        console.error('Cloud sync failed:', err);
        notifyListeners('error');
    }
};

/**
 * Check if API server is reachable.
 */
export const checkApiHealth = async () => {
    try {
        const res = await fetch(`${API_BASE}/`, { method: 'GET' });
        return res.ok;
    } catch {
        return false;
    }
};

// ---- Manual Sales ----

/**
 * Save a manual sale entry to cloud.
 */
export const saveManualSaleToCloud = async (saleData) => {
    return apiCall('/api/manual-sales', {
        method: 'POST',
        body: JSON.stringify(saleData)
    });
};

/**
 * Fetch all manual sales from cloud.
 */
export const fetchManualSalesFromCloud = async () => {
    const result = await apiCall('/api/manual-sales');
    return result.sales || [];
};

/**
 * Delete a manual sale from cloud.
 */
export const deleteManualSaleFromCloud = async (saleId) => {
    return apiCall(`/api/manual-sales/${saleId}`, { method: 'DELETE' });
};

/**
 * Delete a daily note from cloud.
 */
export const deleteNoteFromCloud = async (dateKey) => {
    return apiCall(`/api/daily-notes/${encodeURIComponent(dateKey)}`, { method: 'DELETE' });
};

