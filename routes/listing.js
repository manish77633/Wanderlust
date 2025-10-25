const express = require("express");
const app = express();
const router = express.Router();
const wrapAsync = require("../utils/wrap.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js")
const listingController=require("../controllers/listings.js");
const multer = require("multer");
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage});

//Index Route
// app.js
router.get("/", wrapAsync(listingController.index));

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Show Route
router.get("/:id", wrapAsync(listingController.show));

// Create Route
router.post("/", isLoggedIn, upload.single("listing[image]"), wrapAsync(listingController.newListing));

// router.post("/", isLoggedIn,validateListing, upload.single("listing[image]"), wrapAsync(async (req, res) => {
//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
    
//     if(req.file){
//         newListing.image =  req.file.path; // ya apne storage path ke hisab se
//     }

//     await newListing.save();
//     req.flash("success", "New listing added successfully!");
//     res.redirect("/listings");
// }));


//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListing));

//Update Route
router.put("/:id", isLoggedIn, isOwner, validateListing,upload.single("listing[image]"), wrapAsync(listingController.updateListing));

//Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;