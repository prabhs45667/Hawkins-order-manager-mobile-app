const mongoose = require('mongoose');

const ManualSaleSchema = new mongoose.Schema({
    saleId: { type: String, required: true, unique: true },
    dateKey: { type: String, required: true },   // YYYY-MM-DD
    date: { type: String, required: true },       // Human readable
    pieces: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    timestamp: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ManualSale', ManualSaleSchema);
