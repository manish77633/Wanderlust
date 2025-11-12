const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const profileController = require("../controllers/profile");
const multer = require("multer");
const { userStorage } = require("../cloudConfig"); // Import userStorage
const upload = multer({ storage: userStorage }); // Initialize Multer for user uploads


// ------------------------------------------------------------------
// 1. Profile Main
router.get("/", isLoggedIn, profileController.renderProfile);

// ------------------------------------------------------------------
// 2. Edit Profile
router.get("/edit", isLoggedIn, profileController.renderEditForm);

// POST route for file upload and profile update
router.post(
    "/edit", 
    isLoggedIn, 
    upload.single("profileImage"), // Multer handles file
    profileController.updateProfile
);

// ------------------------------------------------------------------
// 3. Settings
router.get("/settings", isLoggedIn, profileController.renderSettings);

// 4. My Properties
router.get("/my-properties", isLoggedIn, profileController.myProperties);

// 5. Booked Properties
router.get("/booked-properties", isLoggedIn, profileController.renderBookedProperties);

// 6. Book a listing (FIX for 404)
router.post("/bookings/:id", isLoggedIn, profileController.bookListing);

module.exports = router;