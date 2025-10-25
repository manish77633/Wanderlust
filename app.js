if(process.env.NODE_ENV!="production"){
  require('dotenv').config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./utils/wrap.js");
const Review = require("./models/reviews.js");
const {listingschema,reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/error.js");
const dbURL=process.env.ATLASDB_URL
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash=require("connect-flash");


const reviewrouter=require("./routes/review.js");
const listingrouter=require("./routes/listing.js")
const userrouter=require("./routes/user.js")

const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");




main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbURL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);

const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
if(store){
  store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
  });
}
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

app.use(session(sessionOptions));
app.use(flash());

// userauth start
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/demouser", async(req, res) => {
//   let fakeUser = new User({
//     email: "XXXXXXXXXXXXXXXX",
//     username: "XXXXXX",
//   });
//   let registerUser = await User.register(fakeUser, "manish");
//   res.send(registerUser);
// })

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.deletemsg = req.flash("deletemsg");
  res.locals.curuser = req.user;
  next();
});

app.use("/listings", listingrouter);
app.use("/listings/:id/reviews", reviewrouter);
app.use("/", userrouter);



// app.get("/testListing", wrapAsync(async (req, res, next) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// }));

app.use( (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// error handling middleware
app.use((err,req,res,next)=>{
  let {status =505, message="Something went wrong!"} = err  
  res.status(status).render("listings/error.ejs",{message})
  // res.status(status).send(message);
})

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!res.headersSent) {
    res.status(500).send("Something went wrong!");
  }
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});