const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const photoSchema = Schema(
  {
    photoUrl: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    description: { type: String },
    colors: { type: String },
    location: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    addedToCollections: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
  },
  { timestamps: true }
);

const PhotoModel = mongoose.model("Photo", photoSchema);

module.exports = PhotoModel;
