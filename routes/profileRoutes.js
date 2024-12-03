import express from "express";
import authenticateWithJWT from "../middlewares/authenticateWithJWT.js";
import User from "../models/User.js";
import upload from "../middlewares/fileUpload.js";

const router = express.Router();

//Profile Image
//Just takes JWT token from header authorization:{JWT Token}
const getProfileImage = async (req, res) => {
  const { _id } = req.user;
  try {
    const response = await User.findOne(_id).select("profileImage");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

//Unauthenticated method for getting user profile image
const getUserProfileImage = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("profileImage privacySettings");
    if (!user.privacySettings.showProfileImage) {
      return res.status(200).json({
        _id: user._id,
        profileImage: "default.png",
      });
    }
    res.status(200).json({ _id: user._id, profileImage: user.profileImage });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

//Takes a json with image: {profileImage converted to base64}
const updateProfileImage = async (req, res) => {
  const { _id } = req.user;
  if (req.file) {
    try {
      await User.findByIdAndUpdate(_id, { profileImage: req.file.filename });

      res.json({ filename: req.file.filename });
    } catch (error) {
      next(error);
    }
  } else {
    next(new Error("File could not be uploaded !"));
  }
};

//About
//Just takes JWT token from header authorization:{JWT Token}
const getAbout = async (req, res) => {
  const { _id } = req.user;
  try {
    const response = await User.findOne(_id).select("about");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
//When showAboutSection:false returns .
//Unauthenticated method for getting about section using id parameter
const getUserAbout = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("about privacySettings");
    if (!user.privacySettings.showAboutSection)
      return res.status(200).json({ _id: user._id, about: "." });
    res.status(200).json({ _id: user._id, about: user.about });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
//Takes json about:{about}
const updateAbout = async (req, res) => {
  const { about } = req.body;
  const { _id } = req.user;
  try {
    const response = await User.findByIdAndUpdate(
      _id,
      { about: about },
      { new: true }
    );
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

//Status
//Just takes JWT token from header authorization:{JWT Token}
const getStatus = async (req, res) => {
  const { _id } = req.user;
  try {
    const response = await User.findOne(_id).select("status");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
//Get status of users without authentication
const getUserStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await User.findById(id).select("status");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
//Takes json status:{status}
const updateStatus = async (req, res) => {
  const { status } = req.body;
  const { _id } = req.user;
  try {
    const response = await User.findByIdAndUpdate(
      _id,
      { status: status },
      { runValidators: true, new: true }
    );
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

//Block
//Returns blocked users id, status, profile image in blockedUsers[]
const getBlockedUsers = async (req, res) => {
  const { _id } = req.user;

  try {
    //If more information about the blocked users are needed it can be added into .populate()
    const response = await User.findOne(_id)
      .select("blockedUsers")
      .populate("blockedUsers", "username ");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
const blockUser = async (req, res) => {
  //User id to be blocked taken from the parameters
  const { id } = req.params;
  const { _id } = req.user;
  try {
    const response = await User.findByIdAndUpdate(
      _id,
      { $addToSet: { blockedUsers: id } },
      { new: true }
    );

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while blocking the user" });
  }
};
//Unblocks a user
const unblockUser = async (req, res) => {
  //User id to be blocked taken from the parameters
  const { id } = req.params;
  const { _id } = req.user;
  try {
    const response = await User.findByIdAndUpdate(
      _id,
      { $pull: { blockedUsers: id } },
      { new: true }
    );

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while blocking the user" });
  }
};

//PrivacySettings

const getPrivacySettings = async (req, res) => {
  const { _id } = req.user;

  try {
    const response = await User.findById(_id).select("privacySettings");
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};
//Takes boolean values in json body showProfileImage, showAboutSection
//Also can change settings individually
const updatePrivacySettings = async (req, res) => {
  const { showProfileImage, showAboutSection } = req.body;
  const { _id } = req.user;

  try {
    const user = await User.findById(_id);
    if (!user) return res.status(404).json("User does not exist");

    if (showProfileImage !== undefined) {
      user.privacySettings.showProfileImage = showProfileImage;
    }

    if (showAboutSection !== undefined) {
      user.privacySettings.showAboutSection = showAboutSection;
    }

    const response = await user.save();
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

//Routes
router.get("/image", authenticateWithJWT, getProfileImage);
router.get("/image/other/:id", getUserProfileImage);
router.post(
  "/image",
  authenticateWithJWT,
  upload.single("file"),
  updateProfileImage
);

router.get("/about", authenticateWithJWT, getAbout);
router.get("/about/other/:id", getUserAbout);
router.patch("/about", authenticateWithJWT, updateAbout);

router.get("/status", authenticateWithJWT, getStatus);
router.get("/status/other/:id", getUserStatus);
router.patch("/status", authenticateWithJWT, updateStatus);

router.get("/block", authenticateWithJWT, getBlockedUsers);
router.patch("/block/:id", authenticateWithJWT, blockUser);
router.patch("/unblock/:id", authenticateWithJWT, unblockUser);

router.get("/settings", authenticateWithJWT, getPrivacySettings);
router.patch("/settings", authenticateWithJWT, updatePrivacySettings);

export default router;
