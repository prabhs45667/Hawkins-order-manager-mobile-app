const mongoose = require('mongoose');

/**
 * DailyNote — Stores user notes for each day (ENCRYPTED).
 * dateKey and userId are plaintext for querying.
 */
const DailyNoteSchema = new mongoose.Schema({
    dateKey: { type: String, required: true },
    userId: { type: String, default: 'main' },

    // Encrypted note content
    encryptedNote: { type: String },

    // Legacy plaintext field
    note: { type: String, default: undefined },

    updatedAt: { type: Date, default: Date.now }
});

DailyNoteSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('DailyNote', DailyNoteSchema);
