const express = require("expresS");
require("dotenv").config();
const cors = require("cors");
const dbConnection = require("./config/db.config");
dbConnection();
const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.REACT_APP_URI }));

//ROUTES
const UsersRoute = require("./routes/users.routes");
app.use("/users", UsersRoute);

const CollectionsRoute = require("./routes/collections.routes");
app.use("/collections", CollectionsRoute);

const PhotosRoute = require("./routes/photos.routes");
app.use("/photos", PhotosRoute);

const ImageRoute = require("./routes/images-upload.route");
app.use("/", ImageRoute);

app.listen(+process.env.PORT, () => {
  console.log("Server up and running on port:", process.env.PORT);
});
