const Customer = require('../model/customModel');
const grpcErrorHandler = require('../utils/grpcErrorhandling');

const customerController = {
    async createCustomer(call, callback) {
        try {
            const { name, email, phone } = call.request;
            const customer = new Customer({ name, email, phone });
            await customer.save();
            callback(null, {
                message: 'Customer created successfully',
                id: customer._id.toString(),
                name: customer.name,
                email: customer.email,
                phone: customer.phone
            });
        } catch (error) {
            grpcErrorHandler(error, callback);
        }
    },

    async getCustomer(call, callback) {
        try {
            const { id } = call.request;
            const customer = await Customer.findById(id);
            if (!customer) {
                return grpcErrorHandler({ message: 'Customer not found', code: 404 }, callback);
            }
            callback(null, {
                id: customer._id.toString(),
                name: customer.name,
                email: customer.email,
                phone: customer.phone
            });
        } catch (error) {
            grpcErrorHandler(error, callback);
        }
    },

    async updateCustomer(call, callback) {
        try {
            const { id, name, email, phone } = call.request;
            const customer = await Customer.findByIdAndUpdate(id, { name, email, phone }, { new: true });
            if (!customer) {
                return grpcErrorHandler({ message: 'Customer not found', code: 404 }, callback);
            }
            callback(null, {
                message:"Customer updated Successfully !",
                id: customer._id.toString(),
                name: customer.name,    
                email: customer.email,
                phone: customer.phone
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
            const customers = await Customer.find();
            const customerList = customers.map(customer => ({
                id: customer._id.toString(),
                name: customer.name,
                email: customer.email,
                phone: customer.phone
            }));
            callback(null, { customers: customerList });
        } catch (error) {
            grpcErrorHandler(error, callback);
        }
    }
};

module.exports = customerController;
