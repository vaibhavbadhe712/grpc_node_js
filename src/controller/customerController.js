const Customer = require('../model/customModel');
const Product = require('../model/productModel');
const grpcErrorHandler = require('../utils/grpcErrorhandling');
const mongoose = require('mongoose');

const customerController = {
    async createCustomer(call, callback) {
        try {
            const { name, email, phone, productId } = call.request;

            // Validate and convert productId to ObjectId
            const isValidProductId = mongoose.Types.ObjectId.isValid(productId) ? new mongoose.Types.ObjectId(productId) : null;

            const customer = new Customer({ name, email, phone, productId: isValidProductId });
            await customer.save();
            callback(null, {
                message: 'Customer created successfully',
                id: customer._id.toString(),
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                productId: customer.productId ? customer.productId.toString() : null
            });
        } catch (error) {
            grpcErrorHandler(error, callback);
        }
    },

    async getCustomer(call, callback) {
        try {
            const { id } = call.request;
            // Find customer and populate productId field
            const customer = await Customer.findById(id).populate('productId');
    
            if (!customer) {
                return grpcErrorHandler({ message: 'Customer not found', code: 404 }, callback);
            }    
            // Extract product details if productId is available
            const productDetails = customer.productId ? {
                    id: customer.productId._id.toString(),
                    name: customer.productId.name,
                    description: customer.productId.description,
                    price: customer.productId.price,
                    createdAt :customer.productId.createdAt ,
                    updatedAt : customer.productId.updatedAt
            } : null;
    
            callback(null, {
                message: 'Customer details retrieved successfully',
                id: customer._id.toString(),
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                productId: customer.productId ? customer.productId._id.toString() : null,
                product: productDetails // Include product details if available
            });
        } catch (error) {
            grpcErrorHandler(error, callback);
        }
    },
    
    async updateCustomer(call, callback) {  
        try {
            const { id, name, email, phone, productId } = call.request;

            // Validate and convert productId to ObjectId
            const isValidProductId = mongoose.Types.ObjectId.isValid(productId) ? new mongoose.Types.ObjectId(productId) : null;

            const customer = await Customer.findByIdAndUpdate(id, { name, email, phone, productId: isValidProductId }, { new: true }).populate('productId');
            if (!customer) {
                return grpcErrorHandler({ message: 'Customer not found', code: 404 }, callback);
            }
            callback(null, {
                message: "Customer updated Successfully!",
                id: customer._id.toString(),
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                productId: customer.productId ? customer.productId._id.toString() : null
            });
        } catch (error) {
            grpcErrorHandler(error, callback);
        }
    },

    async deleteCustomer(call, callback) {
        try {
            const { id } = call.request;
            const customer = await Customer.findByIdAndDelete(id);
            if (!customer) {
                return grpcErrorHandler({ message: 'Customer not found', code: 404 }, callback);
            }
            callback(null, { message: 'Customer deleted successfully' });
        } catch (error) {
            grpcErrorHandler(error, callback);
        }
    },

    async listCustomers(call, callback) {
        try {
            const customers = await Customer.find().populate('productId');
            const customerList = customers.map(customer => ({
                id: customer._id.toString(),
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                productId: customer.productId ? customer.productId._id.toString() : null,
                product: customer.productId ? {
                    id: customer.productId._id.toString(),
                    name: customer.productId.name,
                    description: customer.productId.description,
                    price: customer.productId.price
                } : null
            }));
            callback(null, { customers: customerList });
        } catch (error) {
            grpcErrorHandler(error, callback);
        }
    }
};

module.exports = customerController;
