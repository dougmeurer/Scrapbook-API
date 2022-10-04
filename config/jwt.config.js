const jwt = require("jsonwebtoken");

const getToken = (user) => {
  const { _id, name, userName, email, role, confirmedEmail } = user;

  console.log(user);
  const signature = process.env.TOKEN_SIGN_SECRET;
  const expirationTime = "6d";

  return jwt.sign(
    { _id, name, userName, email, role, confirmedEmail },
    signature,
    {
      expiresIn: expirationTime,
    }
  );
};

module.exports = getToken;
