const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./config/db");
const userRouter = require("./routes/userRoute");
const videoRouter = require("./routes/videoRoutes");
const cors =  require('cors')
const bodyParser = require('body-parser');
const { prototype } = require("nodemailer/lib/mime-node");

connectDB();
app.use(bodyParser.json({limit: '50mb'})); 
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
console.log(process.env.PORT);
// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

app.use(express.json());
app.use(cors(corsOptions))
app.use("/user", userRouter);
app.use("/video", videoRouter);
app.get("/", (req, res) => {
  res.send(`Server is Working`);
});
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is up and Run with http://localhost:${port}`);
});
