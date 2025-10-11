const { required } = require("joi");
const mongoose =require("mongoose");
const Schema=mongoose.Schema;
const passportlocalmongoose=require('passport-local-mongoose');
const UserSchema=new Schema({
    email:{
        type:String,
        required:true,
    }

});
UserSchema.plugin(passportlocalmongoose); //adds username,password fields and some methods to schema
module.exports=mongoose.model("User",UserSchema);