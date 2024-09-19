// src/utils/grpcLogger.js
const Log = require('../model/loggerModel'); // Adjust the path as necessary

const logRequest = async (apiName, request, status, response, error) => {
    try {
        const log = new Log({
            apiName,
            request,
            status,
            response,
            error,
            timestamp: new Date(),
        });
        await log.save();
    } catch (err) {
        console.error('Failed to log request:', err);
    }
};

module.exports = { logRequest };
