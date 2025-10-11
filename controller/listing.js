const Listing=require("../models/listing");
const ExpressError = require('../utils/ExpressError');

module.exports.index = async (req, res) => {
     let listing = await Listing.find({});
     res.render("listing/home.ejs", { listing });
}

module.exports.newlisting=(req,res)=>{
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be signed in first!'); // Flash error message
        return res.redirect("/login");

    }
    res.render("listing/newlisting.ejs");
}  

module.exports.show = async (req, res) => {
    let {id}=req.params;
    console.log("Listing GET - req.params:", req.params);
    console.log("Listing GET - id:", id);
    
    if (!id) {
        throw new ExpressError(400, 'Listing ID is required');
    }
    
    let show= await Listing.findById(id)
        .populate({ path: 'review', populate: { path: 'author' } })
        .populate("owner")   //to populate reviews in show page
    if(!show){ // Add check for non-existent listing  
        throw new ExpressError(404, 'Listing Not Found!');
    }


    res.render("listing/show.ejs",{show});

}

module.exports.createlisting=async (req,res,next)=>{
    const file = req.file;
    const url = file ? file.path : undefined;
    const filename = file ? file.filename : undefined;
    let list=req.body.listing;     //the thing list[name],list[description] etc used for post to render abd not list.name,list.description
    const newlist=new Listing(list);
    newlist.owner=req.user._id;
    if (url && filename) {
        newlist.image = { url, filename };
    }
    await newlist.save();
    req.flash('success', 'Successfully made a new listing!'); // Flash success message
    res.redirect("/listing");
}

module.exports.editlisting=async(req,res)=>{
    let {id}=req.params;
    let list=await Listing.findById(id);
    if(!list){ // Add check for non-existent listing
        throw new ExpressError(404, 'Listing Not Found!');
    }
    let originalUrl=list.image.url;
    originalUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listing/edit.ejs",{list,originalUrl});

}


module.exports.updatelisting=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing})
    if(typeof req.file!="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    res.redirect(`/listing/${id}`); 
}

module.exports.deletelisting=async (req,res)=>{
    let {id}=req.params;
    let d=await Listing.findByIdAndDelete(id);
    res.redirect("/listing")
}