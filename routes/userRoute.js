const router = require("express").Router();

const upload = require("../util/multer");

const verifyToken = require("../verify/verifyToken");

const {
  register,
  login,
  verification,
  getSingleUser,
  updateProfile,
  changePassword,
  deleteUser,
} = require("../controller/userController");

//otp
var GenerateOtp;

router.get("/", (req, res) => {
  res.send({ msg: "user Route is working" });
});

//signup route
router.post("/signup", upload.single("image"), register);

// Signup verifycation via Gmail

router.put("/signup/verify", verification);

//login route
router.post("/login", login);

//find SingleUser
router.get("/find-user", verifyToken, getSingleUser);

//profile Update Route
router.put("/user-update", verifyToken, upload.single("image"), updateProfile);

//password update Route
router.put("/change-password", verifyToken,changePassword );

//delete user
router.delete("/delete/:id", verifyToken,deleteUser );

module.exports = router;
