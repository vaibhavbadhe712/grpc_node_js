const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  postName: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assuming you have a User model
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Assuming you have a Product model
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, // Assuming you have a Customer model
  address: [
    {
      state: String,
      pincode: String,
      country: String,
      city: String,
    },
  ],
  education: [
    {
      schoolName: String,
      collegeName: String,
      companyName: String,
      experience: Number,
    },
  ],
  description: String,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
