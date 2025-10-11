const mongoose =require("mongoose")
const reviewSchema = new mongoose.Schema({
    review:String,
    Rating:{
        type:Number,
        min:1,
        max:5
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
    
})

module.exports=mongoose.model("Review",reviewSchema);