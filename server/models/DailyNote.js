const mongoose = require('mongoose');

/**
 * DailyNote — Stores user notes for each day.
 * dateKey is the unique identifier (e.g. "2026-04-18").
 */
const DailyNoteSchema = new mongoose.Schema({
    dateKey: { type: String, required: true, unique: true },  // "2026-04-18"
    note: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DailyNote', DailyNoteSchema);
