const postController = require('../controller/postsController');

const postService = {
  CreatePost: postController.createPost,
  GetPost: postController.getPost,
  UpdatePost: postController.updatePost,
  DeletePost: postController.deletePost,
  ListPosts: postController.listPosts,
  SearchPosts: postController.searchPosts,
};

module.exports = postService;
