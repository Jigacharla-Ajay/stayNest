if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}



const express=require('express')
const app=express()
const mongoose=require('mongoose')
const path=require('path')
const ExpressError = require('./utils/ExpressError');
const wrapasync=require('./utils/wrapasync.js');
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
const methodOverride=require("method-override")
app.use(methodOverride("_method")); 

// Temporary shim to silence DEP0044 from dependencies using util.isArray
const util = require('util');
if (typeof util.isArray !== 'function') {
  util.isArray = Array.isArray;
}

const flash=require('connect-flash');
// import axios from 'axios';
const axios = require('axios');

const ejsMate=require("ejs-mate");
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const session=require('express-session')
const MongoStore=require('connect-mongo');
const store=MongoStore.create({
  mongoUrl: process.env.ATLAS_URI,
  crypto: {
    secret: process.env.SECRET_KEY  
  },
  touchAfter: 24 * 3600 // time period in seconds
});

store.on("error",function(e){
  console.log("SESSION STORE ERROR",e)
})

app.use(session({
  store: store,
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
 
}))





// flash must come after session
app.use(flash());


//authentication STUFF
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');

app.use(passport.initialize());

//to use persistent login sessions
app.use(passport.session());

//telling passport to use local strategy and authenticate method from User model
passport.use(new LocalStrategy(User.authenticate()));
//telling passport how to serialize and deserialize a user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




// app.get('/fakeuser', async (req, res) => {
//     const user = new User({
//        email:"jigacharlaajay@gmail.com",
//        username: 'ajay'
//     });
//     const newUser = await User.register(user, 'chicken'); //register method provided by passport-local-mongoose
//     res.send(newUser);
// });

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currentUser=req.user; //req.user is added by passport and contains the currently logged in user
    next();
})





//routers requiring
//listing routes
const listingRoutes=require("./routes/listing");
app.use("/listing",listingRoutes);
 


//review routes
const reviewRoutes=require("./routes/review");
app.use("/listing/:id/reviews",reviewRoutes);


//user routes
const userRoutes=require("./routes/user");
const { connect } = require('http2');
app.use("/",userRoutes);

const dbUrl = process.env.ATLAS_URI;


async function main() {
  try {
    await mongoose.connect(dbUrl)
     
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}


 

main()
.then((res)=>{
    console.log("connected to db");
})
.catch((err) => 
    console.log(err));




// app.get("/",(req,res)=>{
//     res.send("i am working");
// })


const port=3001;
app.listen(port,()=>{
    console.log(`sucessfully connected to ${port}`)
})
app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});

app.use((err,req,res,next)=>{
    const {statusCode = 500, message = 'Something went wrong'} = err;
    res.status(statusCode).render("error.ejs", {statusCode, message});
})




const MODELS = [
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1" },
  { id: "deepseek/deepseek-chat-v3-0324:free", name: "DeepSeek Chat V3" },
  { id: "meta-llama/llama-4-maverick:free", name: "Llama 4 Maverick" },
  { id: "xai/grok-4-fast:free", name: "Grok 4 Fast" }
];

// Chat interface route
app.get("/chat", (req, res) => {
  res.render("pages/chat.ejs");
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  let replyText = "No response.";
  let usedModel = null;

  for (const model of MODELS) {
    try {
      console.log(`🔹 Trying model: ${model.id}`);

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: model.id,
          messages: [{ role: "user", content: userMessage }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "My AI Website",
          },
          timeout: 20000,
        }
      );

      replyText = response.data.choices?.[0]?.message?.content || "No reply.";
      usedModel = model.name;
      console.log(`✅ Success with model: ${model.name}`);
      break; // stop if success
    } catch (err) {
      const status = err.response?.status;
      console.warn(`⚠️ ${model.id} failed (status ${status || "?"})`);

      if (status === 429 || status === 503) {
        // rate-limited or busy → try next
        continue;
      } else {
        console.error(err.response?.data || err.message);
        break;
      }
    }
  }

  res.json({
    reply: usedModel
      ? `🤖 <b>${usedModel}:</b> ${replyText}`
      : "All models failed. Please try again later."
  });
});


