module.exports.isLoggedIn=(req,res,next)=>{
    // console.log(req);
    if(!req.isAuthenticated()){
        // Only store GET URLs to avoid redirecting to non-GET endpoints after login
        if (req.method === 'GET') {
            req.session.redirectUrl = req.originalUrl;
        } else {
            // Fallback to referer or a safe default
            req.session.redirectUrl = req.get('Referer') || '/listing';
        }
        req.flash('error','You must be signed in first!');
        return res.redirect("/login");
    }
    next();
}  

module.exports.saveRedirectedUrl=(req,res,next)=>{
    if(req.session.redirectUrl){    
    res.locals.redirectUrl=req.session.redirectUrl ;
    }
    next();
};
// Default to home if no redirect URL

const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id: listingId, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', 'Review not found');
        return res.redirect(`/listing/${listingId}`);
    }
    if (!req.user || review.author.toString() !== req.user._id.toString()) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/listing/${listingId}`);
    }
    next();
}

