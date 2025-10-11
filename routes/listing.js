const express=require("express");
const router=express.Router();
const Listing=require("../models/listing");
const { listingSchema, reviewSchema } = require('../schema');
const wrapasync=require('../utils/wrapasync.js');
const ExpressError = require('../utils/ExpressError');
//requiring the flash middleware
const { isLoggedIn } = require("../middleware");
const multer  = require('multer');
const { storage } = require('../cloudconfig.js');
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});
// const upload = multer({ dest: 'uploads/' }); //local storage 

// Use bound method directly to preserve Multer's internal context

//controler
const listingController=require("../controller/listing");

//server side validation
//listing validation
const validateListing=(req,res,next)=>{
    const {error}=listingSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(400,msg);
    }
    else{
        next();
    }     
}
//roueter.router
//new post dealing
router.route("/")
.get(wrapasync(listingController.index))
.post(upload.single("listing[image]"), validateListing, wrapasync(listingController.createlisting));

   
// creating new listing - MUST come before parameterized routes
router.get("/new",isLoggedIn,listingController.newlisting);

// edit route should also come before generic "/:id" route
router.get('/:id/edit',isLoggedIn,
    wrapasync(listingController.editlisting));

// parameterized id routes
router.route("/:id")
.get(wrapasync(listingController.show))
.put(isLoggedIn,
    upload.single("listing[image]"),
    wrapasync(listingController.updatelisting)
)
.delete(isLoggedIn,wrapasync(listingController.deletelisting));



// PUT ROUTE TO SEND EDITED CONTENT



// deleting the content
module.exports=router;