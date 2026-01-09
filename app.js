const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");

const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");
const URL = require("./models/url");

const { restrictToLoggedInUserOnly, checkAuth } = require("./middlewares/auth");

const app = express();
const PORT = process.env.PORT || 8001;

const Mongo_URI = process.env.Mongo_URI || "mongodb://127.0.0.1:27017/short-url";

mongoose.connect(Mongo_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// routes
app.use("/url", restrictToLoggedInUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/", checkAuth, staticRoute);
app.use(express.static("public"));
// dynamic redirect route
app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;

  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: {
        visitHistory: { timestamp: Date.now() }
      }
    },
    { new: true }
  );

  if (!entry) return res.status(404).json({ error: "Short URL not found" });

  res.redirect(entry.redirectUrl);
});

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));
