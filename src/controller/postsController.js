const Post = require('../model/postsModel');
const grpcErrorHandler = require('../utils/grpcErrorhandling');
const paginate = require('../utils/paginationhandling');

const postController = {
  async createPost(call, callback) {
    try {
      const { postName, userId, address, education, description, productId, customerId } = call.request;
      const post = new Post({
        postName,
        userId,
        address,
        education,
        description,
        productId,
        customerId
      });
      await post.save();
      callback(null, {
        message: 'Post created successfully',
        id: post._id ? post._id.toString() : '',
        postName: post.postName || '',
        userId: post.userId ? post.userId.toString() : '',
        description: post.description || ''
      });
    } catch (error) {
      grpcErrorHandler(error, callback);
    }
  },

  async getPost(call, callback) {
    try {
      const { id } = call.request;
  
      if (!id) {
        return grpcErrorHandler({ message: 'Post ID is required', code: 400 }, callback);
      }
  
      // Find the post and populate referenced fields
      const post = await Post.findById(id)
        .populate('userId')       // Populate userId with full user object
        .populate('productId')    // Populate productId with full product object
        .populate({
          path: 'customerId',
          populate: {
            path: 'productId',  // Populate productId within customerId
            model: 'Product'    // Ensure 'Product' is the correct model name
          }
        });
  
      if (!post) {
        return grpcErrorHandler({ message: 'Post not found', code: 404 }, callback);
      }
  
      // Extract and format user details
      const userDetails = post.userId ? {
        id: post.userId.userId,  // Use the UUID field
        fullName: post.userId.fullName,
        email: post.userId.email,
        password: post.userId.password,
        groupId: post.userId.groupId,
        // Add other user fields if needed
      } : null;
  
      // Extract and format product details
      const productDetails = post.productId ? {
        id: post.productId._id.toString(),
        name: post.productId.name,
        description: post.productId.description,
        price: post.productId.price,
        createdAt: post.productId.createdAt ? post.productId.createdAt.toISOString() : '',
        updatedAt: post.productId.updatedAt ? post.productId.updatedAt.toISOString() : ''
      } : null;
  
      // Extract and format product details inside customer
      const productDetailsinsideCustomer = post.customerId && post.customerId.productId ? {
        id: post.customerId.productId._id.toString(),
        name: post.customerId.productId.name,
        description: post.customerId.productId.description,
        price: post.customerId.productId.price,
        createdAt: post.customerId.productId.createdAt ? post.customerId.productId.createdAt.toISOString() : '',
        updatedAt: post.customerId.productId.updatedAt ? post.customerId.productId.updatedAt.toISOString() : ''
      } : null;
  
      // Extract and format customer details
      const customerDetails = post.customerId ? {
        id: post.customerId._id.toString(),
        name: post.customerId.name,
        email: post.customerId.email,
        phone: post.customerId.phone,
        productId: productDetailsinsideCustomer,
        createdAt: post.customerId.createdAt ? post.customerId.createdAt.toISOString() : '',
        updatedAt: post.customerId.updatedAt ? post.customerId.updatedAt.toISOString() : ''
      } : null;
  
      // Construct the response
      callback(null, {
        id: post._id.toString(),
        postName: post.postName,
        userId: userDetails,  // Include the User object
        address: post.address,  // Assuming this is an array
        education: post.education,  // Assuming this is an array
        description: post.description,
        productId: productDetails, // Include the Product object
        customerId: customerDetails // Include the Customer object
      });
    } catch (error) {
      console.error('Error in getPost:', error); // Log the error details
      grpcErrorHandler({ message: 'Internal Server Error', code: 500, details: error.message }, callback);
    }
  },
    
  async updatePost(call, callback) {
    try {
      const { id, postName, userId, address, education, description, productId, customerId } = call.request;
      const post = await Post.findByIdAndUpdate(id, {
        postName,
        userId,
        address,
        education,
        description,
        productId,
        customerId
      }, { new: true });

      if (!post) {
        return grpcErrorHandler({ message: 'Post not found', code: 404 }, callback);
      }

      callback(null, {
        id: post._id ? post._id.toString() : '',
        postName: post.postName || '',
        userId: post.userId ? post.userId.toString() : '',
        description: post.description || ''
      });
    } catch (error) {
      grpcErrorHandler(error, callback);
    }
  },

  async deletePost(call, callback) {
    try {
      const { id } = call.request;
      const post = await Post.findByIdAndDelete(id);
      if (!post) {
        return grpcErrorHandler({ message: 'Post not found', code: 404 }, callback);
      }
      callback(null, { message: 'Post deleted successfully' });
    } catch (error) {
      grpcErrorHandler(error, callback);
    }
  },

  async listPosts(call, callback) {
    try {
      const { page, limit } = call.request;
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;

      const paginationResult = await paginate(Post, {}, pageNum, limitNum);

      const postList = paginationResult.items.map(post => ({
        id: post._id ? post._id.toString() : '',
        postName: post.postName || '',
        userId: post.userId ? post.userId.toString() : '',
        description: post.description || ''
      }));

      callback(null, {
        message: 'Posts retrieved successfully',
        posts: postList,
        totalItems: paginationResult.totalItems,
        currentPage: paginationResult.currentPage,
        totalPages: paginationResult.totalPages,
        limit: paginationResult.limit
      });
    } catch (error) {
      grpcErrorHandler(error, callback);
    }
  },

  async searchPosts(call, callback) {
    try {
      const { postName, userId, page, limit } = call.request;
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;

      const searchCriteria = {};
      if (postName) {
        searchCriteria.postName = { $regex: postName, $options: 'i' };
      }
      if (userId) {
        searchCriteria.userId = userId;
      }

      const paginationResult = await paginate(Post, searchCriteria, pageNum, limitNum);

      const postList = paginationResult.items.map(post => ({
        id: post._id ? post._id.toString() : '',
        postName: post.postName || '',
        userId: post.userId ? post.userId.toString() : '',
        description: post.description || ''
      }));

      callback(null, {
        posts: postList,
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

module.exports = postController;
