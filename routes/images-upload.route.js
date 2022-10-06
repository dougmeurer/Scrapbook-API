const express = require("express");
const router = express.Router();
const fileUploader = require("../config/cloudinary.config");
const isAuth = require("../middlewares/isAuth");
const currentUser = require("../middlewares/currentUser");

router.post(
  "/upload-image",
  isAuth,
  currentUser,
  fileUploader.single("picture"),
  (req, res) => {
    console.log(req.file);
    if (!req.file) {
      console.log("erro na rota back");
      return res.status(400).json({ message: "Upload Failed!" });
    }

    res.status(200).json({ url: req.file.path });
  }
);

module.exports = router;
