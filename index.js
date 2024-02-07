// Initialize express app
require("dotenv").config();
// import express.
const express = require("express");
// initialize app as express app.
const app = express();
// helmet for secuirty (modifying headers).
const helmet = require("helmet");
// cors
const cors = require("cors");
// mongoDB collection model.
const Credential = require("./db/connect");

// Secuirty
app.use(helmet({
  crossOriginResourcePolicy: false
}));
// set up cors
app.use(cors());
// Use url-encoded parser
app.use(express.urlencoded({extended: true}));
// Use json parser
app.use(express.json());

// login endpoint for login post requests.
app.post("/login", async (req,res) => {
  // Email and password recieved from user request.
  const email = req.body.email;
  const password = req.body.password;

  try{
    // Try to fetch data based on email and user, (find user)
    const response = await Credential.find({email: email, password: password});
    // Send status code 200 and response json.
    res.status(200).json({res: response})
  }catch (err){
    // If error, send status code 500 and message with err.message
    res.status(500).json({
      message: err.message
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server is listening on port " + port);
});