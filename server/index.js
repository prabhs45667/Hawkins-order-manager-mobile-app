require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const AppData = require('./models/AppData');
const BillRecord = require('./models/BillRecord');
const OrderRecord = require('./models/OrderRecord');
const DailyNote = require('./models/DailyNote');
const ManualSale = require('./models/ManualSale');
const { encrypt, decrypt } = require('./crypto');


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Helper: Extract userId from request (header or query param, defaults to 'main' for backward compat)
const getUserId = (req) => {
    return req.headers['x-user-id'] || req.query.userId || 'main';
};

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Hawkins API Server Running', timestamp: new Date().toISOString() });
});

// ==========================================
// ORDER RECORDS (Quotes distinct from Bills)
// ==========================================
app.post('/api/orders', async (req, res) => {
    try {
        const userId = getUserId(req);
        const orderData = req.body;

        // Encrypt sensitive data
        const sensitiveData = {
            customerName: orderData.customerName,
            date: orderData.date,
            totalBoxes: orderData.totalBoxes,
            totalPieces: orderData.totalPieces,
            lineItems: orderData.lineItems
        };

        const order = await OrderRecord.findOneAndUpdate(
            { orderId: orderData.orderId },
            {
                orderId: orderData.orderId,
                userId,
                dateKey: orderData.dateKey,
                timestamp: orderData.timestamp,
                encryptedData: encrypt(sensitiveData),
                // Clear legacy plaintext fields
                customerName: undefined,
                date: undefined,
                totalBoxes: undefined,
                totalPieces: undefined,
                lineItems: undefined
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ success: true, order });
    } catch (err) {
        console.error('Order save error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { dateKey } = req.query;
        const filter = { userId };
        if (dateKey) filter.dateKey = dateKey;
        const orders = await OrderRecord.find(filter).sort({ timestamp: -1 }).lean();

        // Decrypt orders
        const decryptedOrders = orders.map(order => {
            if (order.encryptedData) {
                const decrypted = decrypt(order.encryptedData);
                if (decrypted) {
                    return { ...order, ...decrypted, encryptedData: undefined };
                }
            }
            // Legacy unencrypted data — return as-is
            return order;
        });

        res.json({ success: true, orders: decryptedOrders });
    } catch (err) {
        console.error('Orders fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// FULL DATA SYNC (Upload entire app state — ENCRYPTED)
// ==========================================
app.post('/api/sync', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { clients, customProducts, mrpOverrides, customPdfNames } = req.body;

        // Encrypt the entire app state as one payload
        const payload = { clients, customProducts, mrpOverrides, customPdfNames };
        const encryptedPayload = encrypt(payload);

        const data = await AppData.findByIdAndUpdate(
            userId,
            {
                _id: userId,
                encryptedPayload,
                // Clear legacy plaintext fields
                clients: undefined,
                customProducts: undefined,
                mrpOverrides: undefined,
                customPdfNames: undefined,
                updatedAt: new Date()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, updatedAt: data.updatedAt });
    } catch (err) {
        console.error('Sync error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// RESTORE (Download full app state — DECRYPTED)
// ==========================================
app.get('/api/restore', async (req, res) => {
    try {
        const userId = getUserId(req);
        const data = await AppData.findById(userId).lean();
        if (!data) {
            return res.json({ success: true, data: null, message: 'No data found' });
        }

        // Decrypt the payload
        if (data.encryptedPayload) {
            const decrypted = decrypt(data.encryptedPayload);
            if (decrypted) {
                return res.json({
                    success: true,
                    data: {
                        _id: data._id,
                        clients: decrypted.clients || [],
                        customProducts: decrypted.customProducts || [],
                        mrpOverrides: decrypted.mrpOverrides || {},
                        customPdfNames: decrypted.customPdfNames || [],
                        updatedAt: data.updatedAt
                    }
                });
            }
        }

        // Legacy unencrypted data — return as-is (backward compat)
        res.json({ success: true, data });
    } catch (err) {
        console.error('Restore error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// BILL RECORDS (ENCRYPTED sensitive fields)
// ==========================================
app.post('/api/bills', async (req, res) => {
    try {
        const userId = getUserId(req);
        const billData = req.body;

        // Encrypt sensitive data
        const sensitiveData = {
            customerName: billData.customerName,
            date: billData.date,
            grandTotal: billData.grandTotal,
            totalBoxes: billData.totalBoxes,
            totalPieces: billData.totalPieces,
            lineItems: billData.lineItems
        };

        const bill = await BillRecord.findOneAndUpdate(
            { billId: billData.billId },
            {
                billId: billData.billId,
                userId,
                dateKey: billData.dateKey,
                timestamp: billData.timestamp,
                encryptedData: encrypt(sensitiveData),
                // Clear legacy plaintext fields
                customerName: undefined,
                date: undefined,
                grandTotal: undefined,
                totalBoxes: undefined,
                totalPieces: undefined,
                lineItems: undefined
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ success: true, bill });
    } catch (err) {
        console.error('Bill save error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get all bills (optionally filter by date) — DECRYPTED
app.get('/api/bills', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { dateKey } = req.query;
        const filter = { userId };
        if (dateKey) filter.dateKey = dateKey;
        const bills = await BillRecord.find(filter).sort({ timestamp: -1 }).lean();

        // Decrypt bills
        const decryptedBills = bills.map(bill => {
            if (bill.encryptedData) {
                const decrypted = decrypt(bill.encryptedData);
                if (decrypted) {
                    return { ...bill, ...decrypted, encryptedData: undefined };
                }
            }
            return bill;
        });

        res.json({ success: true, bills: decryptedBills });
    } catch (err) {
        console.error('Bills fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// DAILY SALES AGGREGATION (decrypts bills for aggregation)
// ==========================================
app.get('/api/daily-sales', async (req, res) => {
    try {
        const userId = getUserId(req);
        const rawBills = await BillRecord.find({ userId }).sort({ timestamp: -1 }).lean();

        // Decrypt all bills first
        const bills = rawBills.map(bill => {
            if (bill.encryptedData) {
                const decrypted = decrypt(bill.encryptedData);
                if (decrypted) return { ...bill, ...decrypted, encryptedData: undefined };
            }
            return bill;
        });

        // Group by dateKey
        const grouped = {};
        bills.forEach(bill => {
            const key = bill.dateKey;
            if (!grouped[key]) {
                grouped[key] = {
                    dateKey: key,
                    date: bill.date,
                    totalBills: 0,
                    totalPieces: 0,
                    totalBoxes: 0,
                    totalAmount: 0,
                    productBreakdown: {},
                    brandBreakdown: {},
                    bills: []
                };
            }

            const day = grouped[key];
            day.totalBills++;
            day.totalPieces += bill.totalPieces || 0;
            day.totalBoxes += bill.totalBoxes || 0;
            day.totalAmount += bill.grandTotal || 0;
            day.bills.push({
                billId: bill.billId,
                customerName: bill.customerName,
                grandTotal: bill.grandTotal,
                totalPieces: bill.totalPieces,
                timestamp: bill.timestamp
            });

            // Aggregate line items
            (bill.lineItems || []).forEach(item => {
                const productKey = item.name || 'Unknown';
                if (!day.productBreakdown[productKey]) {
                    day.productBreakdown[productKey] = { pieces: 0, brand: item.brand || 'Hawkins' };
                }
                day.productBreakdown[productKey].pieces += item.pieces || 0;

                const brand = item.brand || 'Hawkins';
                if (!day.brandBreakdown[brand]) {
                    day.brandBreakdown[brand] = 0;
                }
                day.brandBreakdown[brand] += item.pieces || 0;
            });
        });

        const dailySales = Object.values(grouped).sort((a, b) => b.dateKey.localeCompare(a.dateKey));

        // Fetch and decrypt daily notes
        const rawNotes = await DailyNote.find({ userId }).lean();
        const notesMap = {};
        rawNotes.forEach(n => {
            if (n.encryptedNote) {
                const decrypted = decrypt(n.encryptedNote, false);
                notesMap[n.dateKey] = decrypted || '';
            } else {
                notesMap[n.dateKey] = n.note || '';
            }
        });

        dailySales.forEach(day => {
            day.note = notesMap[day.dateKey] || '';
        });

        res.json({ success: true, dailySales });
    } catch (err) {
        console.error('Daily sales error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// DAILY NOTES (ENCRYPTED)
// ==========================================
app.post('/api/daily-notes', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { dateKey, note } = req.body;
        const result = await DailyNote.findOneAndUpdate(
            { userId, dateKey },
            {
                userId,
                dateKey,
                encryptedNote: encrypt(note || ''),
                note: undefined,  // Clear legacy plaintext
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );
        res.json({ success: true, result });
    } catch (err) {
        console.error('Daily note error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/daily-notes', async (req, res) => {
    try {
        const userId = getUserId(req);
        const rawNotes = await DailyNote.find({ userId }).lean();

        // Decrypt notes
        const notes = rawNotes.map(n => {
            if (n.encryptedNote) {
                const decrypted = decrypt(n.encryptedNote, false);
                return { ...n, note: decrypted || '', encryptedNote: undefined };
            }
            return n;
        });

        res.json({ success: true, notes });
    } catch (err) {
        console.error('Daily notes fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE a daily note by dateKey
app.delete('/api/daily-notes/:dateKey', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { dateKey } = req.params;
        await DailyNote.deleteOne({ userId, dateKey });
        res.json({ success: true });
    } catch (err) {
        console.error('Daily note delete error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// MANUAL SALES (ENCRYPTED)
// ==========================================
app.post('/api/manual-sales', async (req, res) => {
    try {
        const userId = getUserId(req);
        const saleData = req.body;

        // Encrypt sensitive data
        const sensitiveData = {
            date: saleData.date,
            pieces: saleData.pieces,
            amount: saleData.amount,
            notes: saleData.notes
        };

        const sale = await ManualSale.findOneAndUpdate(
            { saleId: saleData.saleId },
            {
                saleId: saleData.saleId,
                userId,
                dateKey: saleData.dateKey,
                timestamp: saleData.timestamp,
                encryptedData: encrypt(sensitiveData),
                // Clear legacy plaintext fields
                date: undefined,
                pieces: undefined,
                amount: undefined,
                notes: undefined
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ success: true, sale });
    } catch (err) {
        console.error('Manual sale save error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/manual-sales', async (req, res) => {
    try {
        const userId = getUserId(req);
        const rawSales = await ManualSale.find({ userId }).sort({ timestamp: -1 }).lean();

        // Decrypt sales
        const sales = rawSales.map(sale => {
            if (sale.encryptedData) {
                const decrypted = decrypt(sale.encryptedData);
                if (decrypted) return { ...sale, ...decrypted, encryptedData: undefined };
            }
            return sale;
        });

        res.json({ success: true, sales });
    } catch (err) {
        console.error('Manual sales fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/manual-sales/:saleId', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { saleId } = req.params;
        await ManualSale.deleteOne({ userId, saleId });
        res.json({ success: true });
    } catch (err) {
        console.error('Manual sale delete error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Hawkins API running on port ${PORT}`);
    console.log('🔐 Data encryption: ENABLED');
});
