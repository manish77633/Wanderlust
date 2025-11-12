const User = require("../models/user");
const Listing = require("../models/listing");

// Profile main page
module.exports.renderProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.render("users/profile", { user });
  } catch (err) {
    console.error("Error loading profile:", err);
    req.flash("error", "Unable to load your profile.");
    res.redirect("/listings");
  }
};

// Edit Profile form
module.exports.renderEditForm = (req, res) => {
  res.render("users/edit", { user: req.user });
};

// Update Profile logic (Assuming POST handles file upload in routes)
module.exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    user.username = username;
    user.email = email;

    if (req.file) {
      user.profileImage = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await user.save();
    req.flash("success", "Profile updated successfully!");
    res.redirect("/profile");
  } catch (err) {
    console.error("Error updating profile:", err);
    req.flash("error", "Error updating profile!");
    res.redirect("/profile/edit");
  }
};

// Settings page
module.exports.renderSettings = (req, res) => {
  res.render("users/settings", { user: req.user });
};

// My Properties - listings created by the logged-in user
module.exports.myProperties = async (req, res) => {
  try {
    const userId = req.user._id;
    const properties = await Listing.find({ owner: userId })
      .populate("owner")
      .populate({
        path: "reviews",
        populate: { path: "author" }
      });

    res.render("users/myProperties.ejs", { properties });
  } catch (err) {
    console.error("Error loading user properties:", err);
    req.flash("error", "Failed to load your listed properties.");
    res.redirect("/profile");
  }
};

// Book a listing
module.exports.bookListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    const user = await User.findById(req.user._id);
    const listing = await Listing.findById(listingId);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    // Check if the user is attempting to book their own property (optional guard)
    if (listing.owner && listing.owner.equals(req.user._id)) {
      req.flash("error", "You cannot book your own listing.");
      return res.redirect(`/listings/${listingId}`);
    }

    // Initialize bookings array if undefined
    if (!user.bookings) user.bookings = [];

    // Avoid duplicate bookings and push the listing ID
    if (!user.bookings.includes(listingId)) {
      user.bookings.push(listingId);
      await user.save();
    }

    req.flash("success", "Booking confirmed! ✅");
    res.redirect("/profile/booked-properties");
  } catch (err) {
    console.error("Error confirming booking:", err);
    req.flash("error", "Failed to confirm booking due to a server error.");
    res.redirect("/listings");
  }
};

// Booked Properties - listings the user has booked
module.exports.renderBookedProperties = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("bookings");
    // Ensure 'bookings' is always an array for safety in EJS
    const userBookings = user.bookings || [];

    res.render("users/bookedproperties", { user, bookings: userBookings });
  } catch (err) {
    console.error("Error loading booked properties:", err);
    req.flash("error", "Unable to load booked properties!");
    res.redirect("/listings");
  }
};