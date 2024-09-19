// src/controllers/productController.js
const Product = require('../model/productModel');
const grpcErrorHandler = require('../utils/grpcErrorhandling');
const paginate = require('../utils/paginationhandling');
const { logRequest } = require('../utils/grpcLogger'); // Import the logging utility

const productController = {
    async createProduct(call, callback) {
        const { name, description, price } = call.request;
        
        try {
            const product = new Product({ name, description, price });
            await product.save();

            await logRequest(
                'CreateProduct',
                call.request,
                'success',
                { id: product._id.toString(), name: product.name, description: product.description, price: product.price },
                null
            );

            callback(null, { message: 'Product created successfully', id: product._id.toString(), name: product.name, description: product.description, price: product.price });
        } catch (error) {
            await logRequest('CreateProduct', call.request, 'error', null, error.message);
            grpcErrorHandler(error, callback);
        }
    },

    async getProduct(call, callback) {
        const { id } = call.request;
        try {
            const product = await Product.findById(id);
            if (!product) {
                await logRequest('GetProduct', call.request, 'error', null, 'Product not found');
                return grpcErrorHandler({ message: 'Product not found', code: 404 }, callback);
            }

            await logRequest(
                'GetProduct',
                call.request,
                'success',
                { id: product._id.toString(), name: product.name, description: product.description, price: product.price },
                null
            );

            callback(null, { id: product._id.toString(), name: product.name, description: product.description, price: product.price });
        } catch (error) {
            await logRequest('GetProduct', call.request, 'error', null, error.message);
            grpcErrorHandler(error, callback);
        }
    },

    async updateProduct(call, callback) {
        try {
            const { id, name, description, price } = call.request;
            const product = await Product.findByIdAndUpdate(id, { name, description, price }, { new: true });
            if (!product) {
                return grpcErrorHandler({ message: 'Product not found', code: 404 }, callback);
            }
            callback(null, { id: product._id.toString(), name: product.name, description: product.description, price: product.price });
        } catch (error) {
            grpcErrorHandler(error, callback);
        }
    },

    async deleteProduct(call, callback) {
        try {
            const { id } = call.request;
            const product = await Product.findByIdAndDelete(id);
            if (!product) {
                return grpcErrorHandler({ message: 'Product not found', code: 404 }, callback);
            }
            callback(null, { message: 'Product deleted successfully' });
        } catch (error) {
            grpcErrorHandler(error, callback);
        }
    },

    async listProducts(call, callback) {
        try {
            const { page, limit } = call.request;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;

            const paginationResult = await paginate(Product, {}, pageNum, limitNum);

            const productList = paginationResult.items.map(product => ({
                id: product._id.toString(),
                name: product.name,
                description: product.description,
                price: product.price
            }));

            callback(null, {
                message: 'Products retrieved successfully',
                products: productList,
                totalItems: paginationResult.totalItems,
                currentPage: paginationResult.currentPage,
                totalPages: paginationResult.totalPages,
                limit: paginationResult.limit
            });
        } catch (error) {
            grpcErrorHandler(error, callback);
        }
    },

    async searchProducts(call, callback) {
        try {
            const { name, price, page, limit } = call.request;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;

            const searchCriteria = {};
            if (name) {
                searchCriteria.name = { $regex: name, $options: 'i' };
            }
            if (price) {
                searchCriteria.price = price;
            }

            const paginationResult = await paginate(Product, searchCriteria, pageNum, limitNum);

            const productList = paginationResult.items.map(product => ({
                id: product._id.toString(),
                name: product.name,
                description: product.description,
                price: product.price
            }));

            callback(null, {
                products: productList,
                totalItems: paginationResult.totalItems,
                currentPage: paginationResult.currentPage,
                totalPages: paginationResult.totalPages,
                limit: paginationResult.limit
            });
        } catch (error) {
            grpcErrorHandler(error, callback);
        }
    }
};

module.exports = productController;
