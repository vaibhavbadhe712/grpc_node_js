const grpc = require('@grpc/grpc-js');
const jwtUtil = require('../utils/jwt'); // Import the JWT utility

// Middleware to check for JWT token
function authenticate(call, callback, next) {
  const metadata = call.metadata.getMap();
  const token = metadata['authorization'];

  if (!token) {
    return callback({
      code: grpc.status.UNAUTHENTICATED,
      message: 'No token provided',
    });
  }

  try {
    // Verify JWT token
    const decoded = jwtUtil.verifyToken(token);

    // Attach user info to call object
    call.user = decoded;
    return next(); // Proceed to the actual method
  } catch (error) {
    return callback({
      code: grpc.status.UNAUTHENTICATED,
      message: 'Invalid token',
    });
  }
}

// Utility function to wrap gRPC service methods with authentication
function withAuthentication(service) {
  const wrappedService = {};

  Object.keys(service).forEach((methodName) => {
    const originalMethod = service[methodName];
    wrappedService[methodName] = (call, callback) => {
      authenticate(call, callback, () => {
        originalMethod(call, callback);
      });
    };
  });

  return wrappedService;
}

module.exports = { withAuthentication };
