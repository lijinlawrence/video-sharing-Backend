const router = require("express").Router();
const verifyToken = require("../verify/verifyToken");
const upload = require("../util/multer");

const {
  uploadVideo,
  addLikes,
  getAllVideos,
  getUserVideo,
  showSingleVideo,
  deleteSingleVideo,
} = require("../controller/videoController");

router.get("/", (req, res) => {
  res.send({ msg: "video Route is Working..." });
});

//video Upload Route
router.post("/create-video/:id", upload.single("video"), uploadVideo);

//add Likes
router.put("/like/:videoID", verifyToken, addLikes);

//list All videos
router.get("/videos", getAllVideos);

//get My Videos

router.get("/my-videos", verifyToken, getUserVideo);

//delete single video
router.delete("/delete/:id", verifyToken, deleteSingleVideo);

//show single video
router.get("/videos/:id", showSingleVideo);
module.exports = router;
