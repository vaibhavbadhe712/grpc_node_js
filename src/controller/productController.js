const Product = require('../model/productModel');
const grpcErrorHandler = require('../utils/grpcErrorhandling');
const paginate = require('../utils/paginationhandling');

const productController = {
    async createProduct(call, callback) {
        try {
            const { name, description, price } = call.request;
            const product = new Product({ name, description, price });
            await product.save();
            callback(null, {
                message: 'Product created successfully',
                id: product._id.toString(),
                name: product.name,
                description: product.description,
                price: product.price
            });
        } catch (error) {
            grpcErrorHandler(error, callback);
        }
    },

    async getProduct(call, callback) {
        try {
            const { id } = call.request;
            const product = await Product.findById(id);
            if (!product) {
                return grpcErrorHandler({ message: 'Product not found', code: 404 }, callback);
            }
            callback(null, {
                id: product._id.toString(),
                name: product.name,
                description: product.description,
                price: product.price
            });
        } catch (error) {
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
            callback(null, {
                id: product._id.toString(),
                name: product.name,
                description: product.description,
                price: product.price
            });
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
            const { page, limit } = call.request; // Extract page and limit from the request
            const pageNum = parseInt(page, 10) || 1; // Ensure it's a valid number
            const limitNum = parseInt(limit, 10) || 10;

            // Use the paginate utility
            const paginationResult = await paginate(Product, {}, pageNum, limitNum);

            // Map product list and ensure correct page data is returned
            const productList = paginationResult.items.map(product => ({
                id: product._id.toString(),
                name: product.name,
                description: product.description,
                price: product.price
            }));

            // Include a message field in the response
            callback(null, {
                message: 'Products retrieved successfully',
                products: productList,
                totalItems: paginationResult.totalItems,
                currentPage: paginationResult.currentPage, // Correct page is now sent
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

            // Build dynamic search query
            const searchCriteria = {};
            if (name) {
                searchCriteria.name = { $regex: name, $options: 'i' }; // Case-insensitive search
            }
            if (price) {
                searchCriteria.price = price;
            }

            // Use the paginate utility
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
