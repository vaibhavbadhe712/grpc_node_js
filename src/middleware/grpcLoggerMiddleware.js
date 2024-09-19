const { logRequest } = require('../utils/grpcLogger');


// src/utils/grpcLoggerMiddleware.js
const grpcLoggerMiddleware = (method) => {
  return async (call, callback) => {
      const start = Date.now();
      const methodName = method.path || method.originalName || "UnknownMethod";

      try {
          // Log the start of the request
          console.log(`Method ${methodName} called with request:`, call.request);

          // Execute the original method
          const result = await new Promise((resolve, reject) => {
              method(call, (err, response) => {
                  if (err) return reject(err);
                  resolve(response);
              });
          });

          const end = Date.now();
          await logRequest(methodName, call.request, 'success', result, null);
          callback(null, result);
      } catch (err) {
          const end = Date.now();
          await logRequest(methodName, call.request, 'error', null, err.message);
          callback(err);
      }
  };
};
module.exports = {
    grpcLoggerMiddleware
  };