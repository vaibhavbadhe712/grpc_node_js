const grpc = require('@grpc/grpc-js');  // Make sure to import the grpc package

// Error handler function
const grpcErrorHandler = (error, callback) => {
  const status = error.code || grpc.status.INTERNAL;
  const message = error.message || 'An unknown error occurred';
  
  callback({
    code: status,
    message: message,
  });
};

module.exports = grpcErrorHandler;
