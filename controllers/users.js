const User=require("../models/user.js")

module.exports.renderSignupForm = (req, res) => {
	res.render("users/signup.ejs")
}

module.exports.signup = async (req, res, next) => {
	const { username, email, password } = req.body;
	const newUser = new User({ email, username });
	const registeredUser = await User.register(newUser, password);
	req.login(registeredUser, (err) => {
		if (err) return next(err);

		req.flash("success", "Welcome to Wanderlust! You are logged in!");
		const redirectUrl = res.locals.redirectUrl || "/listings";
		delete req.session.redirectUrl;
		res.redirect(redirectUrl);
	});
}


module.exports.renderLoginForm = (req, res) => {
	res.render("users/login.ejs")
}


module.exports.login = async (req, res) => {
	req.flash("success", "Welcome back to Wanderlust! You are logged in!");
	const redirectUrl = res.locals.redirectUrl || "/listings";
	delete req.session.redirectUrl; // 🧹 clean the session variable
	res.redirect(redirectUrl);
}


module.exports.logout=(req, res, next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    })
}