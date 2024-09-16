const userController = require('../controller/userController');

const userService = {
  SignUp: userController.signUp,
  SignIn: userController.signIn,
};

module.exports = userService;
