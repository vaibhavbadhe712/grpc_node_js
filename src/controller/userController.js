const User = require('../model/userModel');
const grpcErrorHandler = require('../utils/grpcErrorhandling');
const jwt = require('jsonwebtoken');

// User Controller
const userController = {
  // Sign-up functionality
  async signUp(call, callback) {
    try {
      const { fullName, email, password, groupId } = call.request;

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return grpcErrorHandler({ message: 'Email already exists', code: 409 }, callback);
      } 
   
      // Create a new user
      const user = new User({ fullName, email, password, groupId });
      await user.save();

      // Return the response with the created user object
      callback(null, {
        message: 'User created successfully',
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          groupId: user.groupId.toString(),
          userId: user.userId // Make sure this field exists in your User model
        }
      });
    } catch (error) {
      grpcErrorHandler(error, callback);
    }
  },

  // Sign-in functionality
  async signIn(call, callback) {
    try {
      const { email, password } = call.request;

      // Find the user by email
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return grpcErrorHandler({ message: 'Invalid credentials', code: 401 }, callback);
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Return the response with token and user object
      callback(null, {
        message: 'Login successful',
        token,
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          email: user.email,
          groupId: user.groupId.toString(),
          userId: user.userId // Send userId if available
        }
      }); 
    } catch (error) {
      grpcErrorHandler(error, callback);
    }
  }
};

module.exports = userController;
