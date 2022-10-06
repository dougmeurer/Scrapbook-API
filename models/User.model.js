const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, trim: true },
    userName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    passwordHash: { type: String, required: true },
    profilePicture: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/1053/1053244.png?w=360",
    },
    collections: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    confirmedEmail: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
