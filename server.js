const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./config/db");
const port = parseInt(process.env.PORT);
const userRouter = require("./routes/userRoute");
const videoRouter = require("./routes/videoRoutes");
const cors =  require('cors')
const bodyParser = require('body-parser');
const { prototype } = require("nodemailer/lib/mime-node");

connectDB();
app.use(bodyParser.json({limit: '50mb'})); 
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
console.log(process.env.PORT);

app.use(express.json());
app.use(cors())
app.use("/user", userRouter);
app.use("/video", videoRouter);
app.get("/", (req, res) => {
  res.send(`Server is Working`);
});

app.listen(port, () => {
  console.log(`Server is up and Run with http://localhost:${process.env.PORT}`);
});
