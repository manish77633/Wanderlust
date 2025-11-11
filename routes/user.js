const express = require("express");
const router = express.Router();
const passport = require("passport");
const multer = require("multer");

const User = require("../models/user.js");
const wrapAsync = require("../utils/wrap");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");
const { userStorage } = require("../cloudConfig.js");

// ✅ Multer setup for Cloudinary
const upload = multer({ storage: userStorage });

// ✅ Signup form
router.get("/signup", userController.renderSignupForm);

// ✅ Signup route (with profile image upload)
router.post(
  "/signup",
  upload.single("profileImage"), // 👈 Handle single image upload
  saveRedirectUrl,
  wrapAsync(userController.signup)
);

// ✅ Render login form
router.get("/login", userController.renderLoginForm);

// ✅ Login
router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);

// ✅ Logout
router.get("/logout", userController.logout);

module.exports = router;
