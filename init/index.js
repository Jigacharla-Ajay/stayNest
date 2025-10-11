const mongoose=require('mongoose')
const Listing=require('../models/listing')
const datadata=require('./data.js')
main()
.then((req,res)=>{
    console.log("connected to db");
})
.catch((err) => 
    console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/major');
}

let initdb=async()=>{
    await Listing.deleteMany({});
    datadata.data=datadata.data.map((obj)=>({
        ...obj,owner:"68d6982f8d1b6131c5c7d44f"
    }));
    await Listing.insertMany(datadata.data);
    console.log("db initialized");
}
initdb();

