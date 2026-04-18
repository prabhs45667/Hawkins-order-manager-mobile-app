const mongoose = require('mongoose');

/**
 * AppData — Single document that stores the entire app state snapshot.
 * We use a fixed _id of 'main' so there's only ever one document.
 * This is the primary sync/restore mechanism.
 */
const AppDataSchema = new mongoose.Schema({
    _id: { type: String, default: 'main' },

    clients: [{
        name: String,
        displayName: String,
        bills: [{
            filename: String,
            date: String,
            timestamp: Number,
            totalItems: Number,
            grandTotal: Number,
            boxes: Number,
            pieces: Number,
            remarks: String
        }],
        receipts: [{
            amount: Number,
            date: String,
            timestamp: Number,
            remarks: String
        }],
        amountReceived: Number
    }],

    customProducts: [{
        id: String,
        name: String,
        code: String,
        mrp: Number,
        casePack: Number,
        brand: String
    }],

    mrpOverrides: mongoose.Schema.Types.Mixed,  // { itemId: mrpValue }

    // We store custom PDF metadata only (not the actual PDF data — too large)
    customPdfNames: [String],

    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AppData', AppDataSchema);
