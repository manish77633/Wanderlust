const fetch = require('node-fetch');
const Listing = require("../models/listing.js");

// Escape regex for search input
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// INDEX - list all listings or search + category filter
module.exports.index = async (req, res, next) => {
  const query = req.query.q ? req.query.q.trim() : "";
  const category = req.query.category ? req.query.category.trim() : "";

  let listings;

  // Agar koi search query ya category hai
  if (query || category) {
    const priceQuery = parseInt(query);
    const searchConditions = [];

    if (query) {
      searchConditions.push(
        { title: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } }
      );
      if (!isNaN(priceQuery)) {
        searchConditions.push({ price: priceQuery });
      }
    }

    // Agar category select hai
    const categoryCondition = category ? { category: category } : {};

    // Agar searchConditions bhi hai to $or + category ke saath use karenge
    if (searchConditions.length > 0 && categoryCondition.category) {
      listings = await Listing.find({
        $and: [
          { $or: searchConditions },
          categoryCondition
        ]
      });
    } else if (searchConditions.length > 0) {
      listings = await Listing.find({ $or: searchConditions });
    } else if (categoryCondition.category) {
      listings = await Listing.find(categoryCondition);
    }

    // Agar kuch match nahi hua, to sab show karo
    if (!listings || listings.length === 0) {
      listings = await Listing.find({});
    }

  } else {
    // Default: show all listings
    listings = await Listing.find({});
  }

  res.render("listings/index.ejs", { listings, q: query, category });
};


// NEW - render new listing form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// SHOW - show single listing with geo info
module.exports.show = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate("owner")
      .populate({
        path: "reviews",
        populate: { path: "author" }
      });

    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      return res.redirect("/listings");
    }
    

    let geo = null;

    if (listing.lat && listing.lon) {
      geo = { lat: listing.lat, lon: listing.lon, display_name: listing.location + ', ' + listing.country };
    } else if (listing.location && listing.location.trim().length > 0) {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', listing.location);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');
      url.searchParams.set('addressdetails', '0');
      url.searchParams.set('email', 'manishkumar20047877@gmail.com');

      try {
        const resp = await fetch(url.toString(), { headers: { 'User-Agent': 'WanderlustApp/1.0 (manishkumar20047877@gmail.com)' } });
        if (resp.ok) {
          const results = await resp.json();
          if (results && results.length > 0) {
            geo = {
              lat: parseFloat(results[0].lat),
              lon: parseFloat(results[0].lon),
              display_name: results[0].display_name
            };
            listing.lat = geo.lat;
            listing.lon = geo.lon;
            
            await listing.save();
            console.log(`✅ Geo info added for: ${listing.category}`);
          }
        }
      } catch (err) {
        console.error('Server geocode error:', err);
      }
    }


    console.log(`✅ Loaded listing: ${listing.title}`);
    console.log(`📍 Geo info added for: ${listing.location}`);
    console.log(`📍 Geo info added for: ${listing.category}`);
    res.render("listings/show.ejs", { listing, geo });
  } catch (err) {
    next(err);
  }
};

// CREATE - new listing
module.exports.newListing = async (req, res, next) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  if (req.file) {
    const url = req.file.path;
    const filename = req.file.filename;
    newListing.image = { url, filename };
  }

  await newListing.save();
  req.flash("success", "New listing added successfully!");
  res.redirect("/listings");
};

// EDIT - render edit form
module.exports.editListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250,h_250,c_fill");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// UPDATE - update listing
module.exports.updateListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.location = req.body.listing.location;
  listing.country = req.body.listing.country;
  listing.category = req.body.listing.category;

  if (req.file) {
    const url = req.file.path;
    const filename = req.file.filename;
    listing.image = { url, filename };
  }

  // Update geo info
  if (listing.location && listing.location.trim().length > 0) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", listing.location);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("email", "manishkumar20047877@gmail.com");

    try {
      const resp = await fetch(url.toString(), { headers: { "User-Agent": "WanderlustApp/1.0 (manishkumar20047877@gmail.com)" } });
      if (resp.ok) {
        const results = await resp.json();
        if (results && results.length > 0) {
          listing.lat = parseFloat(results[0].lat);
          listing.lon = parseFloat(results[0].lon);
        }
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }
  }

  await listing.save();
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

// DELETE - delete listing
module.exports.deleteListing = async (req, res, next) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(`🗑️ Deleted listing ID: ${deletedListing._id}`);
  req.flash("deletemsg", "Listing Deleted successfully!");
  res.redirect("/listings");
};
