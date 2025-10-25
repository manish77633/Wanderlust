const Review=require("../models/reviews.js");
const Listing=require("../models/listing.js");

module.exports.createReview=async(req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  console.log(newReview);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success","New review added successfully!");
  res.redirect(`/listings/${listing._id}`); 
}

module.exports.destroyReview=async(req,res)=>{
  const { id, reviewId } = req.params;

  await Review.findByIdAndDelete(reviewId);
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  req.flash("deletemsg", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
}