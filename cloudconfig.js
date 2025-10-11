const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
}); 


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'A_I Places',
    allowed_formats: ["png","jpg","jpeg"], // correct option name per Cloudinary
    // public_id: (req, file) => 'computed-filename-using-request',
  },
});


module.exports = { storage, cloudinary };