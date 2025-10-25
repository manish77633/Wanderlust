const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrap.js");
const ExpressError = require("../utils/error.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController=require("../controllers/reviews.js");




//reviews
//post review route
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview))

router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));


module.exports = router;