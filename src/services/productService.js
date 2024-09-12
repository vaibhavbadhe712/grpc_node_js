const productController = require('../controller/productController');

const productService = {
  CreateProduct: productController.createProduct,
  GetProduct: productController.getProduct,
  UpdateProduct: productController.updateProduct,
  DeleteProduct: productController.deleteProduct,
  ListProducts: productController.listProducts,
  SearchProducts: productController.searchProducts,
};

module.exports = productService;
