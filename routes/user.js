const wrapasync=require('../utils/wrapasync.js');
// const ExpressError = require('../utils/ExpressError');
const express=require("express");
const router=express.Router();
const passport=require('passport');

// import User from '../models/user.js'; rememeber to add .js in import statements in node
const User=require("../models/user");
const { isLoggedIn, saveRedirectedUrl } = require("../middleware");

// Apply the saveRedirectedUrl middleware to all routes in this router
router.use(saveRedirectedUrl);



//get for signup route
router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs");
})

//post for signup route
router.post("/signup",wrapasync(async (req,res,next)=>{
    try{
        const {username,email,password}=req.body;
        const user=new User({username,email});
        const registeredUser=await User.register(user,password);
        console.log("Registered User:", registeredUser);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);

            }
        req.flash('success', 'Welcome to YelpCamp!'); // Flash success message
        res.redirect("/listing");
            
        })
        
    }catch(e){
        req.flash('error', e.message); // Flash error message
        res.redirect("/signup");
    }
}))


//get for login route
router.get("/login",(req,res)=>{
    res.render("user/login.ejs");
})
//post for login route
router.post("/login",saveRedirectedUrl, passport.authenticate('local',{failureFlash:true,failureRedirect:"/login"}), (req,res)=>{
    req.flash('success', 'Welcome back!');
    // let redirectedUrl=res.locals.re // Flash success message
    const redirectUrl=res.locals.redirectUrl || '/listing'; //if there is a url stored in session returnTo then redirect to that otherwise to /listing
    // clear after use so we don't loop or leak paths
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
})

//logout route
router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash('success', "Successfully Logged Out"); // Flash success message
        res.redirect("/listing");
    })
})

module.exports=router;

