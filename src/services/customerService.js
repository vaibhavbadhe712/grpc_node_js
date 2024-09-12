const customerController = require('../controller/customerController');

const customerService = {
  CreateCustomer: customerController.createCustomer,
  GetCustomer: customerController.getCustomer,
  UpdateCustomer: customerController.updateCustomer,
  DeleteCustomer: customerController.deleteCustomer,
  ListCustomers: customerController.listCustomers,
};

module.exports = customerService;
