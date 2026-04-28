const mongoose = require('mongoose');

/**
 * AppData — Stores each user's app state snapshot (ENCRYPTED).
 * Each user/device gets a unique userId so data is isolated.
 * All sensitive data is stored as an encrypted payload.
 */
const AppDataSchema = new mongoose.Schema({
    _id: { type: String },

    // Encrypted JSON string containing: clients, customProducts, mrpOverrides, customPdfNames
    encryptedPayload: { type: String },

    // Legacy plaintext fields (kept for backward compatibility during migration)
    clients: { type: mongoose.Schema.Types.Mixed, default: undefined },
    customProducts: { type: mongoose.Schema.Types.Mixed, default: undefined },
    mrpOverrides: { type: mongoose.Schema.Types.Mixed, default: undefined },
    customPdfNames: { type: mongoose.Schema.Types.Mixed, default: undefined },

    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AppData', AppDataSchema);
