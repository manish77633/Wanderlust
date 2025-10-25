
const express=require("express")
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync = require("../utils/wrap");
const passport = require("passport"); 
const { saveRedirectUrl}=require("../middleware.js")  
const userController=require("../controllers/users.js") 


//signup form
router.get("/signup",userController.renderSignupForm)

//siginup
router.post(
  "/signup",
  saveRedirectUrl, // 👈 ye line add kar
  wrapAsync(userController.signup)
);



//render login form
router.get("/login",userController.renderLoginForm)

//login
router.post("/login",
     saveRedirectUrl,
      passport.authenticate("local",{
        failureRedirect:"/login",
        failureFlash:true
    }),
    userController.login  )


//logout
router.get("/logout",userController.logout)

module.exports=router;