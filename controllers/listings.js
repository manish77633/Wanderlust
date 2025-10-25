const fetch = require('node-fetch');
const Listing = require("../models/listing.js"); 


module.exports.index=async (req, res, next) => {
  const listings = await Listing.find({});
  res.render("listings/index.ejs", { listings });
}

module.exports.renderNewForm=(req, res) => {
  res.render("listings/new.ejs");
}

 

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

    // Default: no geo
    let geo = null;

    // Agar lat/lon pehle se saved hai, use kar lo
    if (listing.lat && listing.lon) {
      geo = {
        lat: listing.lat,
        lon: listing.lon,
        display_name: listing.location + ', ' + listing.country
      };
    } else if (listing.location && listing.location.trim().length > 0) {
      // Server-side Nominatim geocoding
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', listing.location);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');
      url.searchParams.set('addressdetails', '0');
      url.searchParams.set('email', 'manishkumar20047877@gmail.com');

      try {
        const resp = await fetch(url.toString(), {
          headers: { 'User-Agent': 'WanderlustApp/1.0 (manishkumar20047877@gmail.com)' }
        });
        if (resp.ok) {
          const results = await resp.json();
          if (results && results.length > 0) {
            geo = {
              lat: parseFloat(results[0].lat),
              lon: parseFloat(results[0].lon),
              display_name: results[0].display_name
            };
            // Optional: database me save kar do taaki next time server call na ho
            listing.lat = geo.lat;
            listing.lon = geo.lon;
            await listing.save();
          }
        }
      } catch (err) {
        console.error('Server geocode error:', err);
      }
    }
    console.log(listing);
    console.log(geo);
    res.render("listings/show.ejs", { listing, geo });
  } catch (err) {
    next(err);
  }
};




module.exports.newListing=async (req, res, next) => {
  let url=req.file.path;
  let filename=req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image={url,filename}; 
  await newListing.save();
  req.flash("success", "New listing added successfully!");
  res.redirect("/listings");
}

module.exports.editListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,h_250,c_fill");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  // Update listing fields from form
  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.location = req.body.listing.location;
  listing.country = req.body.listing.country;

  // Image update
  if (req.file) {
    const url = req.file.path;
    const filename = req.file.filename;
    listing.image = { url, filename };
  }

  // Location update via geocoding
  if (listing.location && listing.location.trim().length > 0) {
    const fetch = require("node-fetch");
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", listing.location);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("email", "manishkumar20047877@gmail.com");

    try {
      const resp = await fetch(url.toString(), {
        headers: { "User-Agent": "WanderlustApp/1.0 (manishkumar20047877@gmail.com)" },
      });
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

  await listing.save(); // ✅ Database me save ho raha hai
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing=async (req, res, next) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("deletemsg", "Listing Deleted successfully!");
  res.redirect("/listings");


}