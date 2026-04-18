const mongoose = require('mongoose');

/**
 * OrderRecord — Stores detailed line items for every "Order" generated.
 * This is separate from BillRecord, as Orders are just quotes/inquiries,
 * whereas Bills represent finalized daily sales.
 */
const OrderRecordSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customerName: String,
    date: String,
    dateKey: String,
    timestamp: Number,
    totalBoxes: Number,
    totalPieces: Number,

    lineItems: [{
        name: String,
        code: String,
        brand: { type: String, default: 'Hawkins' },
        type: String,      // 'box' or 'pcs'
        qty: Number,        // raw quantity
        pieces: Number      // total pieces
    }],

    createdAt: { type: Date, default: Date.now }
});

OrderRecordSchema.index({ dateKey: 1 });

module.exports = mongoose.model('OrderRecord', OrderRecordSchema);
