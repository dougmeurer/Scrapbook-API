const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const collectionSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User" },
    collectionName: { type: String, default: "New Collection" },
    collectionDetails: { type: String, required: true },
    photos: [{ type: Schema.Types.ObjectId, ref: "Photo" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const CollectionModel = mongoose.model("Collection", collectionSchema);

module.exports = CollectionModel;
