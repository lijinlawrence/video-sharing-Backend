const validator = require("validator");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("../model/UserModel");
const jwt = require("jsonwebtoken");
const upload = require("../util/multer");
const cloudinary = require("../util/cloudinary");
const verifyToken = require("../verify/verifyToken");
const Video = require("../model/VideoModel");
const nodemailer = require("nodemailer");


// register
exports.register = async (req, res) => {
    //otp
var GenerateOtp;
    try {
      const { name, mobile, age, email, password, otp } = req.body;
  
      const validEmail = await validator.isEmail(email);
      const UserExist = await User.findOne({ email: email });
  
      if (!name || !mobile || !age || !email || !password) {
        return res.send({ msg: "Fill The all Required Fields" });
      } else {
        if (!validEmail) {
          return res.send({ msg: "Please Enter Valid Email" });
        }
        if (!UserExist) {
          if (password.length < 8) {
            return res.send({ msg: "Password must be have 8 letters" });
          }
  
          const salt = Number(process.env.SALT);
  
          const HashedPassword = await bcrypt.hashSync(password, salt);
          var result;
          if (req.file) {
            result = await cloudinary.uploader.upload(req.file.path);
          }
  
          const user = {
            name,
            mobile,
            image: result
              ? result.secure_url
              : "https://res.cloudinary.com/dzrk0cozg/image/upload/v1714120488/Profile-PNG-Free-Download_zln07r.png",
            age,
            email,
            password: HashedPassword,
            cloudinary_id: result ? result.public_id : "",
          };
          if (!otp) {
            return res.send({ msg: "Please Enter Otp" });
          }
          if (GenerateOtp != otp) {
            return res.send({ msg: "Otp is wrong" });
          }
          await User.create(user);
  
          res.send({ msg: "user Created Successfully" });
        } else {
          res.send({ msg: "user already exists" });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }


//   verification

exports.verification=async (req, res) => {
    try {
      const { email } = req.body;
      const validEmail = await validator.isEmail(email);
      if (!email) {
        return res.status(404).send({ msg: "enter email addresss" });
      }
      if (!validEmail) {
        return res.status(404).send({ msg: "please enter valid email" });
      }
  
      GenerateOtp = Math.floor(Math.random() * 1000000);
  
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
  
      // const mailOptions = {
      //   from: '"METUBE" <no-reply@metube.com>',
      //   to: email,
      //   subject: "Email Verification",
      //   text: "Welcome to our Website",
      //   html: `<p>Your OTP is <h2>${GenerateOtp}</h2></p>`,
      // };
  
      const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject:'OTP verification',
        text: "Welcome to our Website",
        html: `<p>Your OTP is <h2>${GenerateOtp}</h2></p>`,
    }
  
      await transporter.sendMail(message);
  
      res.status(200).send({ msg: "email send" });
      return GenerateOtp;
    } catch (error) {
      console.log(error.message);
    }
  }




//login
  exports.login =async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
  
      if (user) {
        const PSCheck = bcrypt.compareSync(password, user.password);
        if (PSCheck) {
          const token = jwt.sign({ id: user._id }, process.env.SECRET_JWT);
          res.send({ token });
        } else {
          return res.send({ msg: "incorrect password" });
        }
      } else {
        return res.send({ msg: "User Doesn`t exist" });
      }
    } catch (error) {
      console.log(error);
    }
  }


 //get single user
 
exports.getSingleUser = async (req, res) => {
    try {
      const id = req.id;
      const response = await User.findById(id);
      res.send(response);
    } catch (error) {
      console.log(error);
    }
  }

//update profile

exports.updateProfile =  async (req, res) => {
    try {
      const id = req.id;
      let user = await User.findById(id);

      if (user) {
        //delete the exiting profile picture if want change

        if (req.file) {
          //delete existing dp
          if (user.cloudinary_id) {
            await cloudinary.uploader.destroy(
              user.cloudinary_id,
              (err, info) => {
                if (err) {
                  return console.log(err.message);
                } else {
                  return console.log("profile image deleted");
                }
              }
            );
          }
          //adding new dp
          var newImg = await cloudinary.uploader.upload(req.file.path);
        }

        const result = {
          name: req.body.name || user.name,
          mobile: req.body.mobile || user.mobile,
          image: newImg ? newImg.secure_url : user.image,
          age: req.body.age || user.age,
          email: req.body.email || user.email,
          password: user.password,
          cloudinary_id: newImg ? newImg.public_id : user.cloudinary_id,
        };

        const UpdateUser = await User.findByIdAndUpdate(req.id, result, {
          new: true,
        });
        res.status(201).send({ msg: "user Updated Successfully" });
      }
    } catch (error) {
      console.log(error);
    }
  }


//change Pasword

exports.changePassword =async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await User.findById(req.id);
      const verifyPassword = await bcrypt.compareSync(oldPassword, user.password);
      if (verifyPassword) {
        const HashPassword = await bcrypt.hashSync(newPassword, 10);
        const data = {
          password: HashPassword,
        };
        let UpdatedPassword = await User.findByIdAndUpdate(req.id, data, {
          new: true,
        });
        res.status(201).send({ msg: "password Changed Successfully" });
      } else {
        return res.send({ msg: "old password is wrong" });
      }
    } catch (error) {
      console.log(error);
    }
  }

 
  //delete user
  exports.deleteUser =async (req, res) => {
    try {
      const id = req.params.id;
  
      //delete all user videos;
      const user = await User.findById(id).populate("videos");
  
      if (user) {
        let TotalVideos = user.videos;
        if (TotalVideos) {
          for (let i = 0; i < TotalVideos.length; i++) {
            const video = TotalVideos[i];
            //delete video from cloud
            if (video.cloudinary_id) {
              await cloudinary.uploader.destroy(
                video.cloudinary_id,
                (err, info) => {
                  if (err) {
                    return console.log(err.message);
                  } else {
                    return console.log("profile image deleted");
                  }
                }
              );
            }
            //delete video from database
            await Video.findByIdAndDelete(TotalVideos[i]);
          }
        }
      }
      //delete  profile picture from cloudinary
      if (user.cloudinary_id) {
        await cloudinary.uploader.destroy(user.cloudinary_id, (err, info) => {
          if (err) {
            return console.log(err.message);
          } else {
            return console.log("profile image deleted");
          }
        });
      }
  
      const deleteUser = await User.findByIdAndDelete(req.params.id);
      res.status(201).send({ msg: "account deleted SuccessFully" });
    } catch (error) {
      console.log(error);
    }
  }



