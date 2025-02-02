const User = require("../model/UserModel");
const cloudinary = require("../util/cloudinary");
const upload = require("../util/videoMulter");
const Video = require("../model/VideoModel");

exports.uploadVideo = async (req, res) => {
    try {
      const { title, description } = req.body;
      console.log(req.file);
      if (!req.file) {
        return res.send({ msg: "please select the video" });
      }
      if (!title || !description) {
        return res.send({ msg: "fill the required fields" });
      }
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(400).send({ msg: "not authorized" });
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "video",
      });
      const Createvideo = {
        title,
        description,
        video: result.secure_url,
        cloudinary_id: result.public_id,
        user: req.params.id,
      };
  
      const video = await Video.create(Createvideo);
      await User.findByIdAndUpdate(
        req.params.id,
        {
          $push: { videos: video._id },
        },
        { new: true }
      );
      res.status(201).send({ msg: "video uploaded SuccessFully" });
    } catch (error) {
      console.log(error);
    }
  }


 //add likes
 
 exports.addLikes = async (req, res) => {
    try {
      const videoID = req.params.videoID;
  
      const video = await Video.findById(videoID);
      const user = await User.findById(req.id);
  
      if (!user) {
        return res.send({ msg: "user not found" });
      }
      if (video.like.includes(user._id)) {
        let index = video.like.indexOf(user._id);
        let arr = video.like.splice(index, 1);
        await video.save();
        return res.status(200).send({ msg: "like removed successfully" });
      } else {
        video.like.push(user._id);
        await video.save();
        return res.status(201).send({ msg: "liked successfully" });
      }
    } catch (error) {
      console.log(error);
      res.send({ msg: error.message });
    }
  }

 //get all videos
 
 exports.getAllVideos =async (req, res) => {
    try {
      const response = await Video.find().populate("user", "_id name image");
      res.send(response);
    } catch (error) {
      console.log(error.message);
    }
  }


//get my videos
exports.getUserVideo =   async(req,res)=>{
    try {
      const user = await User.findById(req.id).populate('videos');
      if(user){
        res.status(200).send(user.videos)
      }
    } catch (error) {
      console.log(error)
    }
  }


//delet single video
exports.deleteSingleVideo=async (req, res) => {
    try {
      const video = await Video.findById(req.params.id);
      if(video.cloudinary_id){
        await cloudinary.uploader.destroy(
          video.cloudinary_id,
          (err, info) => {
            if (err) {
              return console.log(err.message);
            } else {
              return console.log("video Deleted deleted");
            }
          }
        );
      }
  
      const response = await Video.findByIdAndDelete(req.params.id);
      if (response) {
        res.status(201).send({ msg: "video Deleted SuccessFully" });
      }
    } catch (error) {
      console.log(error.message);
    }
  }

// show single video
  exports.showSingleVideo=async (req, res) => {
    try {
      const videoID = req.params.id;
      const response = await Video.findById(videoID).populate(
        "user",
        "_id name image"
      );
  
      res.send(response);
    } catch (error) {
      console.log(error.message);
    }
  }

