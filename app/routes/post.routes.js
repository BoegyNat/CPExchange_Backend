const { authJwt } = require("../middleware");
const postController = require("../controllers/post.controller");
const multer = require("multer");
const upload = multer();
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/get_all_post_by_idUser/:idUser",
    [authJwt.verifyToken],
    postController.getAllPostByIdUser
  );

  app.get(
    "/api/get_all_post_for_bookmark_by_idUser/:idUser",
    [authJwt.verifyToken],
    postController.getAllPostForBookmarkByIdUser
  );

  app.get(
    "/api/get_post_by_idPost/:idPost",
    [authJwt.verifyToken],
    postController.getPostByIdPost
  );

  app.get("/api/get_post_by_idTag/:idTag", postController.getPostByIdTag);

  app.post(
    "/api/get_post_by_idTag",
    [authJwt.verifyToken],
    postController.getPostByIdTagWithIdUser
  );

  app.get(
    "/api/get_post_by_idSubTag/:idSubTag",
    postController.getPostByIdSubTag
  );

  app.post(
    "/api/get_post_by_idSubTag",
    postController.getPostByIdSubTagWithIdUser
  );

  app.get("/api/get_all_post", postController.getAllPost);

  app.post(
    "/api/post_click_like_post",
    [authJwt.verifyToken],
    postController.postClickLikePost
  );

  app.post(
    "/api/post_click_bookmark_post",
    [authJwt.verifyToken],
    postController.postClickBookmarkPost
  );

  app.get(
    "/api/get_post_by_priority/:idUser",
    [authJwt.verifyToken],
    postController.getPostByPriority
  );

  app.get(
    "/api/get_post_by_priority_for_submmited_post/:idPost",
    [authJwt.verifyToken],
    postController.getPostByPriorityForSubmmitedPost
  );

  app.post(
    "/api/post_create_post",
    [authJwt.verifyToken, upload.array("attachment")],
    postController.postCreatePost
  );

  app.post(
    "/api/post_edit_post",
    [authJwt.verifyToken, upload.array("attachment")],
    postController.postEditPost
  );

  app.delete(
    "/api/post_delete_post/:idPost",
    [authJwt.verifyToken],
    postController.deletePostById
  );
};
