const grpc = require('@grpc/grpc-js');  // Make sure to import the grpc package

function grpcErrorHandler(error, callback) {
  console.error('Error:', error.message);

  let statusCode = grpc.status.INTERNAL; // Default to INTERNAL error

  switch (error.code) {
    case 400:
      statusCode = grpc.status.INVALID_ARGUMENT;
      break;
    case 404: 
      statusCode = grpc.status.NOT_FOUND;
      break;
    case 409:
      statusCode = grpc.status.ALREADY_EXISTS;
      break;
    case 403:
      statusCode = grpc.status.PERMISSION_DENIED;
      break;
    case 401:
      statusCode = grpc.status.UNAUTHENTICATED;
      break;
    default:
      statusCode = grpc.status.INTERNAL;
      break;
  }

  callback({
    code: statusCode,
    message: error.message
  });
}


module.exports = grpcErrorHandler;
