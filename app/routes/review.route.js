const { authJwt } = require("../middleware");
const reviewController = require("../controllers/review.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    app.get(
      "/api/reviews",
      [authJwt.verifyToken],
      reviewController.getAllReviews
    );
  
    app.get(
      "/api/review/:carId",
      [authJwt.verifyToken],
      reviewController.getReviewsByCarId
    );
    app.post(
      "/api/add_new_review",
      [authJwt.verifyToken],
      reviewController.postNewReview
    );
    app.get(
      "/api/all_reviews_by_search",
      [authJwt.verifyToken],
      reviewController.getAllReviewsBySearch
    );
};