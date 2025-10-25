const mongoose = require("mongoose");
const Review = require("./reviews");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url:String,
    filename:String
  },
  price: Number,
  location: String,
  lat:{
    type:Number,
    // default:28.6139
  },
  lon:{
    type:Number,
    // default:77.2088
  },
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
  next();
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;