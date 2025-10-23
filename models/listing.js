const mongoose =require("mongoose")
const review=require("./review")


const listingSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:
    {
        type:String,
        required:true,
        trim:true
    },
    image:{
        url:String,
        filename:String
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    location:
    {
        type:String,
        required:true,
        trim:true
    },
    country:
    {
        type:String,
        required:true,
        trim:true
    },
    review: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    tags: [String]
})


// deleting associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function(listing) {
    if(listing){
        await review.deleteMany({ _id: { $in: listing.review } })

    }
})
const Listing = mongoose.model("Listing",listingSchema)
module.exports = Listing