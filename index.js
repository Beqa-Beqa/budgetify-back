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
const {Credential, Account, Transaction} = require("./db/connect");

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
    const credentialResponse = await Credential.findOne({email: email, password: password});
    // Fetch current user's accounts data.
    const accountsResponse = await Account.find({owner: credentialResponse._id});
    // Retrieve ids of accounts.
    const accountsIds = accountsResponse.map((accountData) => accountData._id);
    // Fetch current user's transactions data.
    const transanctionResponse = await Transaction.find({belongsToAccountWithId: {$in: accountsIds}});
    // Send status code 200 and response json.
    res.status(200).json({
      credentialRes: credentialResponse,
      accountsData: accountsResponse,
      transactionsData: transanctionResponse
    })
  }catch (err){
    // If error, send status code 500 and message with err.message
    res.status(500).json({
      message: err.message
    });
  }
});

app.post("/create-account", async (req,res) => {
  try {
    // destructure request body.
    const {userId, accountData} = req.body;
    const {title, currency, description, amount} = accountData;

    // createa ccount.
    const result = await Account.create({
      owner: userId,
      title,
      currency,
      amount: amount || "0",
      description
    });
    // send back the created accaount info.
    res.status(201).json(result);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

app.patch("/edit-account", async (req,res) => {
  try {
    const {accId, fields} = req.body.infoForEdit;
    const result = await Account.findOneAndUpdate({_id: accId}, fields, {returnDocument: "after"});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
});

app.post("/delete-account", async (req,res) => {
  try {
    const {accId, userId} = req.body;
    const result = await Account.deleteOne({owner: userId, _id: accId});
    res.json(201).json({result});
  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
});

app.post("/create-transaction", async (req,res) => {
  try {
    const {belongsToAccountWithId, transactionType, title, description, amount, date, chosenCategories} = req.body.transactionData;
    const currentEnvTimeInUnix = new Date().getTime().toString();

    const result = await Transaction.create({
      belongsToAccountWithId,
      transactionType,
      title,
      description,
      amount,
      date,
      chosenCategories,
      creationDate: currentEnvTimeInUnix,
      updateDate: currentEnvTimeInUnix
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server is listening on port " + port);
});