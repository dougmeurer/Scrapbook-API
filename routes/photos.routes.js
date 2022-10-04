const express = require("express");
const router = express.Router();
const UserModel = require("../models/User.model");
const CollectionModel = require("../models/Collection.model");
const PhotoModel = require("../models/Photo.model");
const getToken = require("../config/jwt.config");
const isAuth = require("../middlewares/isAuth");
const currentUser = require("../middlewares/currentUser");

router.post("/create/:collectionId", isAuth, currentUser, async (req, res) => {
  try {
    const { collectionId } = req.params;

    const newPhoto = await PhotoModel.create({
      ...req.body,
      uploadedBy: req.thisUser._id,
      addedToCollections: collectionId,
    });

    await CollectionModel.findByIdAndUpdate(collectionId, {
      $addToSet: { photos: newPhoto._id },
    });

    return res.status(200).json(newPhoto);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/photo/:photoId", isAuth, currentUser, async (req, res) => {
  try {
    const { photoId } = req.params;

    const getPhoto = await PhotoModel.findById(photoId);

    return res.status(200).json(getPhoto);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.put("/edit/:photoId", isAuth, currentUser, async (req, res) => {
  try {
    const { photoId } = req.params;

    const editPhoto = await PhotoModel.findByIdAndUpdate(
      photoId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(editPhoto);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.put("/add-like/:photoId", isAuth, currentUser, async (req, res) => {
  try {
    const { photoId } = req.params;

    const addLike = await PhotoModel.findByIdAndUpdate(
      photoId,
      { $addToSet: { likes: req.thisUser._id } },
      { new: true }
    );

    return res.status(200).json(addLike);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.put("/remove-like/:photoId", isAuth, currentUser, async (req, res) => {
  try {
    const { photoId } = req.params;

    const revokeLike = await PhotoModel.findByIdAndUpdate(
      photoId,
      {
        $pull: { likes: req.thisUser._id },
      },
      { new: true }
    );

    return res.status(200).json(revokeLike);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.delete("/delete/:photoId", isAuth, currentUser, async (req, res) => {
  try {
    const { photoId } = req.params;

    await PhotoModel.findByIdAndDelete(photoId);

    await CollectionModel.findByIdAndUpdate(
      photoId,
      { $pull: { photos: photoId } },
      { new: true }
    );

    return res.send("picture deleted and removed from collections!");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
