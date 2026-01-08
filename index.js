const express=require("express");

const urlRoute=require("./routes/url");
const staticRoute=require("./routes/staticRouter");
const userRoute=require("./routes/user");

const {connectMongoDb}=require("./connection");

const URL=require("./models/url");
const cookieParser=require("cookie-parser");

const path=require("path");
const app=express();
const PORT=8001;
//Connect
connectMongoDb("mongodb://127.0.0.1:27017/short-url")
    .then(()=>console.log("MongoDb connected"));

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));
//middleware
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
const {restrictToLoggedInUserOnly,checkAuth}=require("./middlewares/auth");
//Route
app.use("/url",restrictToLoggedInUserOnly,urlRoute);
app.use("/user",userRoute);
app.use("/",checkAuth,staticRoute);

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;

  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    },
    { new: true } // optional but good
  );

  if (!entry) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  res.redirect(entry.redirectUrl);
});

app.listen(PORT,()=>console.log(`Server Started at PORT:${PORT}`));