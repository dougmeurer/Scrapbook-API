const express = require("express");
const router = express.Router();
const fileUploader = require("../config/cloudinary.config");
const isAuth = require("../middlewares/isAuth");
const currentUser = require("../middlewares/currentUser");

router.post(
  "/upload-image",
  isAuth,
  currentUser,
  fileUploader.single("images"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Upload Failed!" });
    }

    res.status(200).json({ url: req.file.path });
  }
);

module.exports = router;
