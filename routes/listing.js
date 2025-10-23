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



// GET /listings?search=...&tags=...
router.get("/listings", async (req, res) => {
    try {
        const { search, tags } = req.query; // tags can be comma-separated
        
        const query = {};

        // Search by title, description, or location (case-insensitive)
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ];
        }

        // Filter by tags
        if (tags) {
            const tagsArray = tags.split(","); // e.g., "Beachfront,Trending"
            query.tags = { $in: tagsArray };
        }

    const listings = await Listing.find(query).populate("owner review");
    // render the existing listing home view and pass variables expected by the template
    res.render("listing/home.ejs", { listing: listings, searchQuery: search, tags });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});



// deleting the content
module.exports=router;