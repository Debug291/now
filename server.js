const dotenv = require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoute = require("./routes/userRoute");
const productsRoute = require("./routes/productsRoute");
const paymentRoute = require("./routes/paymentRoute");
const favoriteCompareRoute = require('./routes/favoriteCompareRoute');
const cartRoute = require("./routes/cartRoute");
const couponRoute = require("./routes/couponRoute");
const contactRoute = require("./routes/contactRoute");
const orderRoute = require("./routes/orderRoute");
const errorHandler = require("./middleWare/errorMiddleware");
const cookieParser = require("cookie-parser");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8081;
const mongoUri = process.env.MONGODB_URI || process.env.DATABASE;

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://buysell-market.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json()); // This makes sure Express can parse JSON bodies
// Routes Middleware
app.use("/api/users", userRoute);
app.use("/api/products", productsRoute);
app.use("/api/products", favoriteCompareRoute);
app.use("/api/cart", cartRoute);
app.use("/api/coupon", couponRoute);
app.use("/api/contactus", contactRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/orders", orderRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", (req, res) => {
  return res.status(404).json({ message: "API route not found" });
});

cloudinary.config({
  cloud_name : process.env.CLOUD_NAME,//process.env.CLOUDINARY_NAME
  api_key    : process.env.CLOUD_API_KEY,//process.env.CLOUDINARY_API_KEY
  api_secret : process.env.CLOUD_API_SECRET,//process.env.CLOUDINARY_API_SECRET
});

// Routes
app.get("*", (req, res) => {
  res.send("Home Page");
});
app.get("/favicon.ico", (req, res) => res.status(204));

// Error Middleware
app.use(errorHandler);
mongoose.set('strictQuery', true);

const connectDatabase = async () => {
  if (!mongoUri) {
    console.warn("No MongoDB URI configured. Set MONGODB_URI or DATABASE before starting the server.");
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      minPoolSize: 2,
      maxPoolSize: 10,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Database connection error:", err.message || err);
    console.error("If this is MongoDB Atlas, make sure the current IP address is whitelisted and the URI credentials are valid.");
  }
};

connectDatabase();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
  });
}

module.exports = app;