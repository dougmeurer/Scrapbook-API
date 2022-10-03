const express = require("expresS");
require("dotenv").config();
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.REACT_APP_URI }));

//ROUTES
console.log("hello world!");

app.listen(+process.env.PORT, () => {
  console.log("Server up and running on port:", process.env.PORT);
});
