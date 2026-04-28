const mongoose = require('mongoose');

/**
 * ManualSale — Manual sales entries (ENCRYPTED sensitive fields).
 * saleId, userId, dateKey, timestamp are plaintext for querying.
 */
const ManualSaleSchema = new mongoose.Schema({
    saleId: { type: String, required: true, unique: true },
    userId: { type: String, default: 'main' },
    dateKey: { type: String, required: true },
    timestamp: { type: Number, required: true },

    // Encrypted JSON string containing: date, pieces, amount, notes
    encryptedData: { type: String },

    // Legacy plaintext fields
    date: { type: String, default: undefined },
    pieces: { type: Number, default: undefined },
    amount: { type: Number, default: undefined },
    notes: { type: String, default: undefined },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ManualSale', ManualSaleSchema);
