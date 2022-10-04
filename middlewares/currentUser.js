const UserModel = require("../models/User.model");

async function currentUser(req, res, next) {
  try {
    const loggedUser = req.auth; // comes from isAuth
    const user = await UserModel.findOne(
      {
        _id: loggedUser._id,
      },
      { passwordHash: 0 }
    );

    if (!user.confirmedEmail) {
      return res
        .status(400)
        .json({ message: "Error, user account not activated!" });
    }
    req.thisUser = user;

    next();
  } catch (error) {
    console.log("dentro do erro", error);
    return res.status(500).json(error);
  }
}

module.exports = currentUser;
