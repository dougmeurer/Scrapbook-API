const express = require("express");
const router = express.Router();
const UserModel = require("../models/User.model");
const CollectionModel = require("../models/Collection.model");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const nodemailer = require("nodemailer");
const getToken = require("../config/jwt.config");
const isAuth = require("../middlewares/isAuth");
const currentUser = require("../middlewares/currentUser");
const PhotoModel = require("../models/Photo.model");

let transporter = nodemailer.createTransport({
  service: "Outlook",
  auth: {
    secure: false,
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

router.post("/sign-up", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      !password ||
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/
      )
    ) {
      return res
        .status(400)
        .json({ message: "Please, provide a valid password" });
    }

    const salt = await bcrypt.genSalt(saltRounds);

    const hashPass = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      ...req.body,
      passwordHash: hashPass,
    });

    delete newUser._doc.passwordHash;

    const emailMessage = {
      from: process.env.USER,
      to: email,
      subject: "Account Activation",
      text: "Welcome to SnapScrap, Please confirm your e-mail below and start your journey Scrapping pictures and collections away",
      html: `<p>Click on the below link to confirm your account.</p>
      <a href=http://localhost:8000/users/activate-account/${newUser._id}>Click Here</a>`,
    };

    await transporter.sendMail(emailMessage);

    return res.status(200).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/activate-account/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const confirmedUser = await UserModel.findById(userId);

    if (!confirmedUser) {
      return res.send(
        "Failed to active account, please verify your account and try again!"
      );
    }

    await UserModel.findByIdAndUpdate(userId, { confirmedEmail: true });
    res.send("Account activated successfully!");
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please, provide a valid email or password" });
    }

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: "User not Found!" });
    }

    if (await bcrypt.compare(password, user.passwordHash)) {
      delete user._doc.passwordHash;
      const token = getToken(user);

      return res.status(200).json({ user: user, token: token });
    } else {
      res.status(400).json({ message: "username or password incorrect." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get("/profile", isAuth, currentUser, async (req, res) => {
  try {
    return res.status(200).json(req.thisUser);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.get("/all-users", isAuth, currentUser, async (req, res) => {
  try {
    const allUsers = await UserModel.find({}, { passwordHash: 0 }).populate(
      "collections"
    );
    // excessao para o delete._doc pq da erro
    return res.status(200).json(allUsers);
  } catch (error) {
    console.log("no erro", error);
    res.status(400).json(error);
  }
});

router.get("/user/:userId", isAuth, currentUser, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId)
      .populate("followers")
      .populate("following")
      .populate("collections");

    delete user._doc.passwordHash;

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.put("/edit-user", isAuth, currentUser, async (req, res) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.thisUser,
      { ...req.body },
      { new: true, runValidators: true }
    );

    delete updatedUser._doc.passwordHash;

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.put("/follow/:followedUserId", isAuth, currentUser, async (req, res) => {
  try {
    const { followedUserId } = req.params;

    const userFollowing = await UserModel.findByIdAndUpdate(
      req.thisUser._id,
      { $addToSet: { following: followedUserId } },

      { new: true }
    );

    delete userFollowing._doc.passwordHash;

    const userFollowed = await UserModel.findByIdAndUpdate(followedUserId, {
      $addToSet: { followers: req.thisUser._id },
    });

    const emailAlert = {
      from: process.env.USER,
      to: userFollowed.email,
      subject: "You have a new follower!",
      html: `<p>Hi ${
        userFollowed.userName ? userFollowed.userName : userFollowed.email
      }, ${userFollowing.userName} just started following you, Say Hello!</p>`,
    };

    await transporter.sendMail(emailAlert);

    return res.status(200).json(userFollowing);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.put(
  "/unfollow/:unfollowedUserId",
  isAuth,
  currentUser,
  async (req, res) => {
    try {
      const { unfollowedUserId } = req.params;

      const userUnfollowing = await UserModel.findByIdAndUpdate(
        req.thisUser._id,
        { $pull: { following: unfollowedUserId } },
        { new: true }
      );

      const userFollowed = await UserModel.findByIdAndUpdate(
        unfollowedUserId,
        { $pull: { followers: req.thisUser._id } },
        { new: true }
      );

      delete userUnfollowing._doc.passwordHash;

      return res.status(200).json(userUnfollowing);
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  }
);

router.delete("/delete", isAuth, currentUser, async (req, res) => {
  try {
    const deletedUser = await UserModel.findByIdAndDelete(req.thisUser._id, {
      new: true,
    });

    await UserModel.deleteMany(
      { followers: req.thisUser._id, following: req.thisUser._id },
      { followers: req.thisUser._id, following: req.thisUser._id }
    );

    await PhotoModel.deleteMany(
      { uploadedBy: req.thisUser._id },
      { uploadedBy: req.thisUser._id }
    );

    deletedUser.collections.forEach(async (collection) => {
      await CollectionModel.findByIdAndDelete(collection._id);
    });

    return res.send("User deleted, photos deleted, collections deleted");
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

module.exports = router;
