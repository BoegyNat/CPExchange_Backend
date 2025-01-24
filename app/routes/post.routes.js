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

  app.get("/api/get_all_post", postController.getAllPost);

  app.post(
    "/api/post_click_like_post",
    [authJwt.verifyToken],
    postController.postClickLikePost
  );

  app.get(
    "/api/get_post_by_priority/:idUser",
    [authJwt.verifyToken],
    postController.getPostByPriority
  );

  app.get(
    "/api/get_post_by_priority_for_submmited_post/:idUser",
    [authJwt.verifyToken],
    postController.getPostByPriorityForSubmmitedPost
  );

  app.post(
    "/api/post_create_post",
    [authJwt.verifyToken, upload.array("attachment")],
    postController.postCreatePost
  );
};
