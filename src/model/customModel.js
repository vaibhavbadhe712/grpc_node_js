const mongoose = require('mongoose');


const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' } // Ensure ref is correctly set
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);


