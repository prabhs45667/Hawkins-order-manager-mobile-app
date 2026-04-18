require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const AppData = require('./models/AppData');
const BillRecord = require('./models/BillRecord');
const OrderRecord = require('./models/OrderRecord');
const DailyNote = require('./models/DailyNote');
const ManualSale = require('./models/ManualSale');


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
        const orderData = req.body;
        const order = await OrderRecord.findOneAndUpdate(
            { orderId: orderData.orderId },
            orderData,
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
        const { dateKey } = req.query;
        const filter = dateKey ? { dateKey } : {};
        const orders = await OrderRecord.find(filter).sort({ timestamp: -1 }).lean();
        res.json({ success: true, orders });
    } catch (err) {
        console.error('Orders fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// FULL DATA SYNC (Upload entire app state)
// ==========================================
app.post('/api/sync', async (req, res) => {
    try {
        const { clients, customProducts, mrpOverrides, customPdfNames } = req.body;

        const data = await AppData.findByIdAndUpdate(
            'main',
            {
                _id: 'main',
                clients: clients || [],
                customProducts: customProducts || [],
                mrpOverrides: mrpOverrides || {},
                customPdfNames: customPdfNames || [],
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
// RESTORE (Download full app state)
// ==========================================
app.get('/api/restore', async (req, res) => {
    try {
        const data = await AppData.findById('main').lean();
        if (!data) {
            return res.json({ success: true, data: null, message: 'No data found' });
        }
        res.json({ success: true, data });
    } catch (err) {
        console.error('Restore error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// BILL RECORDS (Detailed line items for daily sales)
// ==========================================
app.post('/api/bills', async (req, res) => {
    try {
        const billData = req.body;
        const bill = await BillRecord.findOneAndUpdate(
            { billId: billData.billId },
            billData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ success: true, bill });
    } catch (err) {
        console.error('Bill save error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get all bills (optionally filter by date)
app.get('/api/bills', async (req, res) => {
    try {
        const { dateKey } = req.query;
        const filter = dateKey ? { dateKey } : {};
        const bills = await BillRecord.find(filter).sort({ timestamp: -1 }).lean();
        res.json({ success: true, bills });
    } catch (err) {
        console.error('Bills fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// DAILY SALES AGGREGATION
// ==========================================
app.get('/api/daily-sales', async (req, res) => {
    try {
        const bills = await BillRecord.find({}).sort({ timestamp: -1 }).lean();

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
                // Product breakdown — group by general category
                const productKey = item.name || 'Unknown';
                if (!day.productBreakdown[productKey]) {
                    day.productBreakdown[productKey] = { pieces: 0, brand: item.brand || 'Hawkins' };
                }
                day.productBreakdown[productKey].pieces += item.pieces || 0;

                // Brand breakdown
                const brand = item.brand || 'Hawkins';
                if (!day.brandBreakdown[brand]) {
                    day.brandBreakdown[brand] = 0;
                }
                day.brandBreakdown[brand] += item.pieces || 0;
            });
        });

        // Convert to array sorted by date desc
        const dailySales = Object.values(grouped).sort((a, b) => b.dateKey.localeCompare(a.dateKey));

        // Fetch daily notes
        const notes = await DailyNote.find({}).lean();
        const notesMap = {};
        notes.forEach(n => { notesMap[n.dateKey] = n.note; });

        // Attach notes
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
// DAILY NOTES
// ==========================================
app.post('/api/daily-notes', async (req, res) => {
    try {
        const { dateKey, note } = req.body;
        const result = await DailyNote.findOneAndUpdate(
            { dateKey },
            { dateKey, note, updatedAt: new Date() },
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
        const notes = await DailyNote.find({}).lean();
        res.json({ success: true, notes });
    } catch (err) {
        console.error('Daily notes fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE a daily note by dateKey
app.delete('/api/daily-notes/:dateKey', async (req, res) => {
    try {
        const { dateKey } = req.params;
        await DailyNote.deleteOne({ dateKey });
        res.json({ success: true });
    } catch (err) {
        console.error('Daily note delete error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// MANUAL SALES (User-added sales entries)
// ==========================================
app.post('/api/manual-sales', async (req, res) => {
    try {
        const saleData = req.body;
        const sale = await ManualSale.findOneAndUpdate(
            { saleId: saleData.saleId },
            saleData,
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
        const sales = await ManualSale.find({}).sort({ timestamp: -1 }).lean();
        res.json({ success: true, sales });
    } catch (err) {
        console.error('Manual sales fetch error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete('/api/manual-sales/:saleId', async (req, res) => {
    try {
        const { saleId } = req.params;
        await ManualSale.deleteOne({ saleId });
        res.json({ success: true });
    } catch (err) {
        console.error('Manual sale delete error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Hawkins API running on port ${PORT}`);
});

