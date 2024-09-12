const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const connectDB = require('./config/db');
const productService = require('./services/productService');
const customerService = require('./services/customerService');
require('dotenv').config();

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
server.addService(combinedProto.product.ProductService.service, productService);
server.addService(combinedProto.customer.CustomerService.service, customerService);

const PORT = process.env.GRPC_PORT || '50051';

connectDB().then(() => {
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Failed to bind server:', err);
      return;
    }
    console.log(`gRPC server running on port ${port}`);
  });
});
