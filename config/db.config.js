const mongoose = require("mongoose");

async function connect() {
  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to server!", dbConnection.connection.name);
  } catch (error) {
    console.log("Connection failed!", error);
  }
}

module.exports = connect;
