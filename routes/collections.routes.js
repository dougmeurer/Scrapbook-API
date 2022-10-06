const express = require("express");
const router = express.Router();
const UserModel = require("../models/User.model");
const CollectionModel = require("../models/Collection.model");
const PhotoModel = require("../models/Photo.model");
const isAuth = require("../middlewares/isAuth");
const currentUser = require("../middlewares/currentUser");

router.post("/create/", isAuth, currentUser, async (req, res) => {
  try {
    const newCollection = await CollectionModel.create({
      ...req.body,
      author: req.thisUser._id,
    });

    await UserModel.findByIdAndUpdate(req.thisUser._id, {
      $addToSet: { collections: newCollection },
    });

    return res.status(201).json(newCollection);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/collections", isAuth, currentUser, async (req, res) => {
  try {
    const allCollections = await CollectionModel.find();

    return res.status(200).json(allCollections);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get(
  "/collection/:collectionId",
  isAuth,
  currentUser,
  async (req, res) => {
    try {
      const { collectionId } = req.params;

      const getCollection = await CollectionModel.findById(collectionId)
        .populate("author")
        .populate("photos");

      return res.status(200).json(getCollection);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);

router.get("/my-collections", isAuth, currentUser, async (req, res) => {
  try {
    const myCollections = await CollectionModel.find({
      author: req.thisUser._id,
    }).populate("photos");

    return res.status(200).json(myCollections);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.put("/edit/:collectionId", isAuth, currentUser, async (req, res) => {
  try {
    const { collectionId } = req.params;

    const editCollection = await CollectionModel.findByIdAndUpdate(
      collectionId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json(editCollection);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post(
  "/add-collection/:collectionId",
  isAuth,
  currentUser,
  async (req, res) => {
    try {
      const { collectionId } = req.params;

      const toCollection = await UserModel.findByIdAndUpdate(
        req.thisUser._id,
        {
          $push: { collections: collectionId },
        },
        { new: true }
      );

      delete toCollection._doc.passwordHash;

      return res.status(200).json(toCollection);
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  }
);

router.put(
  "/remove-collection/:collectionId",
  isAuth,
  currentUser,
  async (req, res) => {
    try {
      const { collectionId } = req.params;

      const fromCollection = await UserModel.findByIdAndUpdate(
        req.thisUser._id,
        { $pull: { collections: collectionId } },
        { new: true }
      );

      delete fromCollection._doc.passwordHash;

      return res.status(200).json(fromCollection);
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  }
);

router.put("/add-like/:collectionId", isAuth, currentUser, async (req, res) => {
  try {
    const { collectionId } = req.params;

    const addLike = await CollectionModel.findByIdAndUpdate(
      collectionId,
      {
        $addToSet: { likes: req.thisUser._id },
      },
      { new: true }
    );

    await UserModel.findByIdAndUpdate(req.thisUser._id);
    return res.status(200).json(addLike);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.put(
  "/remove-like/:collectionId",
  isAuth,
  currentUser,
  async (req, res) => {
    try {
      const { collectionId } = req.params;

      const revokeLike = await CollectionModel.findByIdAndUpdate(
        collectionId,
        { $pull: { likes: req.thisUser._id } },
        { new: true }
      );

      return res.status(200).json(revokeLike);
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  }
);

router.delete(
  "/delete/:collectionId",
  isAuth,
  currentUser,
  async (req, res) => {
    try {
      const { collectionId } = req.params;

      const deleteCollection = await CollectionModel.findByIdAndDelete(
        collectionId,
        { new: true }
      );

      await UserModel.updateMany(
        { collections: collectionId },
        {
          $pull: { collections: collectionId },
        }
      );

      deleteCollection.photos.forEach(async (photo) => {
        await PhotoModel.findByIdAndDelete(photo._id);
      });

      return res.send("Collection deleted, users updated, photos deleted.");
    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  }
);
module.exports = router;
