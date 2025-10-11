const express=require("express");
const router=express.Router({ mergeParams: true });
const Listing=require("../models/listing");
const Review=require("../models/review");
const { listingSchema, reviewSchema } = require('../schema');
const wrapasync=require('../utils/wrapasync.js');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isReviewAuthor } = require("../middleware");




//review validation
const validatereview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg=error.details.map(el=>el.message).join(',')
        throw new ExpressError(400,msg);
    }
    else{
        next();
    }
}


//review route for saving to database
//and server side validation for review
router.post("/", isLoggedIn, validatereview, wrapasync(async (req,res)=>{
    const { id: listingId } = req.params;

    if (!listingId) {
        throw new ExpressError(400, 'Listing ID is required');
    }

    let listing = await Listing.findById(listingId);
    if (!listing) {
        throw new ExpressError(404, 'Listing not found');
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.review.push(newReview._id);
    await newReview.save();
    await listing.save();
    res.redirect(`/listing/${listing._id}`);
}))



//server side validation for listing

//deleting review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapasync(async (req, res) => {
    const { id: listingId, reviewId } = req.params;

    if (!listingId) {
        throw new ExpressError(400, 'Listing ID is required');
    }
    if (!reviewId) {
        throw new ExpressError(400, 'Review ID is required');
    }

    await Listing.findByIdAndUpdate(listingId, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listing/${listingId}`);
}));



module.exports=router;