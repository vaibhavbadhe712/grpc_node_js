require('dotenv').config();

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const connectDB = require('./config/db');
const productService = require('./services/productService');
const customerService = require('./services/customerService');
const userService = require('./services/userService');
const { withAuthentication } = require('./middleware/authMiddleware'); // Import the auth middleware
const postService = require('./services/postsService');
 const {grpcLoggerMiddleware} =require('./middleware/grpcLoggerMiddleware');
// Log environment variables to verify they are loaded
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('GRPC_PORT:', process.env.GRPC_PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const COMBINED_PROTO_PATH = path.join(__dirname, '../proto/combined.proto');
const packageDefinition = protoLoader.loadSync(COMBINED_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const combinedProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

const wrappedProductService = {};
Object.keys(productService).forEach((methodName) => {
  wrappedProductService[methodName] = grpcLoggerMiddleware(productService[methodName]);
});

// Add services with authentication middleware
// server.addService(
//   combinedProto.product.ProductService.service,
//   withAuthentication(productService)
// );
server.addService(
  combinedProto.customer.CustomerService.service,
  withAuthentication(customerService)
);
server.addService(combinedProto.post.PostService.service, postService,wrappedProductService);
server.addService(
  combinedProto.product.ProductService.service,
  wrappedProductService
);


server.addService(combinedProto.user.UserService.service, userService);

const PORT = process.env.GRPC_PORT || '50051';

connectDB().then(() => {
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Failed to bind server:', err);
        return;
      }
      console.log(`gRPC server running on port ${port}`);
    }
  );
});
