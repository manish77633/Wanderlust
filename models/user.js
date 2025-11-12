const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  profileImage: {
    url: String,
    filename: String,
  },
    bookings: [
    {
      type: Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
});

// ✅ Virtual to automatically create thumbnail (Cloudinary transformation)
userSchema.virtual("thumbnail").get(function () {
  if (this.profileImage && this.profileImage.url) {
    return this.profileImage.url.replace("/upload", "/upload/w_200"); // small size
  }
  return "/images/default-user.png"; // default image if none
});

// Include virtuals in JSON output (optional but helpful)
userSchema.set("toJSON", { virtuals: true });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
