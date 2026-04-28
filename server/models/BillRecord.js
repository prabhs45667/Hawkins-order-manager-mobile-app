const mongoose = require('mongoose');

/**
 * BillRecord — Stores bill data (ENCRYPTED sensitive fields).
 * Only billId, userId, dateKey, timestamp are plaintext for querying.
 * All business data (customer, items, amounts) is encrypted.
 */
const BillRecordSchema = new mongoose.Schema({
    billId: { type: String, required: true, unique: true },
    userId: { type: String, default: 'main' },
    dateKey: String,       // e.g. "2026-04-18" for grouping (plaintext for queries)
    timestamp: Number,

    // Encrypted JSON string containing: customerName, date, grandTotal, totalBoxes, totalPieces, lineItems
    encryptedData: { type: String },

    // Legacy plaintext fields (for backward compatibility)
    customerName: String,
    date: String,
    grandTotal: Number,
    totalBoxes: Number,
    totalPieces: Number,
    lineItems: { type: mongoose.Schema.Types.Mixed, default: undefined },

    createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
BillRecordSchema.index({ userId: 1, dateKey: 1 });

module.exports = mongoose.model('BillRecord', BillRecordSchema);
