const mongoose = require('mongoose');

/**
 * OrderRecord — Stores order/quote data (ENCRYPTED sensitive fields).
 * Only orderId, userId, dateKey, timestamp are plaintext for querying.
 */
const OrderRecordSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, default: 'main' },
    dateKey: String,
    timestamp: Number,

    // Encrypted JSON string containing: customerName, date, totalBoxes, totalPieces, lineItems
    encryptedData: { type: String },

    // Legacy plaintext fields
    customerName: String,
    date: String,
    totalBoxes: Number,
    totalPieces: Number,
    lineItems: { type: mongoose.Schema.Types.Mixed, default: undefined },

    createdAt: { type: Date, default: Date.now }
});

OrderRecordSchema.index({ userId: 1, dateKey: 1 });

module.exports = mongoose.model('OrderRecord', OrderRecordSchema);
