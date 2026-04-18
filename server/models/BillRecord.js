const mongoose = require('mongoose');

/**
 * BillRecord — Stores detailed line items for every bill generated.
 * Used for the Daily Sales Summary (pieces sold, brand breakdown).
 * Each bill has multiple line items with product name, brand, quantities.
 */
const BillRecordSchema = new mongoose.Schema({
    billId: { type: String, required: true, unique: true },
    customerName: String,
    date: String,          // e.g. "18 Apr 2026"
    dateKey: String,       // e.g. "2026-04-18" for grouping
    timestamp: Number,
    grandTotal: Number,
    totalBoxes: Number,
    totalPieces: Number,

    lineItems: [{
        name: String,
        code: String,
        brand: { type: String, default: 'Hawkins' },
        type: String,      // 'box' or 'pcs'
        qty: Number,        // raw quantity
        pieces: Number,     // total pieces (boxes * casePack or raw pcs)
        mrp: Number,
        finalPrice: Number
    }],

    createdAt: { type: Date, default: Date.now }
});

// Index for efficient date-based queries
BillRecordSchema.index({ dateKey: 1 });

module.exports = mongoose.model('BillRecord', BillRecordSchema);
