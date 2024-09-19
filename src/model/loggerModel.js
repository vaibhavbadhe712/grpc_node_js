// src/models/logModel.js
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    apiName: { type: String, required: true },
    request: { type: Object, required: true },
    status: { type: String, required: true },
    response: { type: Object, required: false },
    error: { type: String, required: false },
    timestamp: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
