// Initialize express app
require("dotenv").config();
const fs = require("fs");
const path = require("path");
// import express.
const express = require("express");
// initialize app as express app.
const app = express();
// helmet for secuirty (modifying headers).
const helmet = require("helmet");
// cors
const cors = require("cors");
// mongoDB collection model.
const {Credential, Account, Transaction, Category} = require("./db/connect");
const multer = require("multer");
const {removeFilesFromUploadsIfNotIncluded, removeFoldersFromUploadsIfEmpty, removeEmptyFoldersFromUploads} = require("./functions");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if(!fs.existsSync(`uploads/${req.body.id}`)) fs.mkdirSync(`uploads/${req.body.id}`);
    cb(null, `uploads/${req.body.id}`);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({storage});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
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
    // Fetch current user's categories data.
    const categoriesResponse = await Category.find({owner: credentialResponse._id});
    // Send status code 200 and response json.
    res.status(200).json({
      credentialRes: credentialResponse,
      accountsData: accountsResponse,
      transactionsData: transanctionResponse,
      categoriesData: categoriesResponse
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
    const accountDeleteResult = await Account.deleteOne({owner: userId, _id: accId});
    const transactionsDeleteResult = await Transaction.deleteMany({belongsToAccountWithId: accId});
    res.status(201).json({accountDeleteResult, transactionsDeleteResult});
  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
});

app.post("/create-transaction", upload.any(), async (req,res) => {
  try {
    const {id, belongsToAccountWithId, transactionType, title, description, amount, date, chosenCategories, payee} = req.body;
    const currentEnvTimeInUnix = new Date().getTime().toString();
    const filesPathArray = req.files && req.files.map((file) => {return {name: file.originalname, path: file.path, type: file.mimetype, size: file.size}});

    removeFilesFromUploadsIfNotIncluded(__dirname, id, filesPathArray);
    removeEmptyFoldersFromUploads(__dirname);

    const result = await Transaction.create({
      id,
      belongsToAccountWithId,
      transactionType,
      title,
      description,
      amount,
      date,
      chosenCategories,
      payee,
      creationDate: currentEnvTimeInUnix,
      updateDate: currentEnvTimeInUnix,
      files: filesPathArray || []
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

app.patch("/edit-transaction", upload.any(), async (req,res) => {
  try {
    const currentEnvTimeInUnix = new Date().getTime().toString();
    const {transactionId, belongsToId, fields} = req.body;
    const filesPathArray = req.files && req.files.map((file) => {return {name: file.originalname, path: file.path, type: file.mimetype, size: file.size}});
    if(filesPathArray) fields.files = filesPathArray;

    removeFilesFromUploadsIfNotIncluded(__dirname, id, filesPathArray);
    removeEmptyFoldersFromUploads(__dirname);

    const result = await Transaction.findOneAndUpdate({id: transactionId, belongsToAccountWithId: belongsToId}, {...fields, updateDate: currentEnvTimeInUnix}, {returnDocument: "after"});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

app.post("/delete-transaction", async (req,res) => {
  const {transactionId, belongsToId} = req.body;
  try {
    const result = await Transaction.deleteOne({id: transactionId, belongsToAccountWithId: belongsToId});
    fs.rmSync(`uploads/${transactionId}`, {recursive: true, force: true});
    removeEmptyFoldersFromUploads();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.post("/create-category", async (req,res) => {
  const {owner, title, transactionType} = req.body;
  try {
    const result = await Category.create({owner, title, transactionType});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.patch("/edit-category", async (req,res) => {
  const {owner, categoryId, fields} = req.body.infoForEdit;
  try {
    const result = await Category.findOneAndUpdate({owner, _id: categoryId}, fields, {returnDocument: "after"});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.post("/delete-category", async (req,res) => {
  const {owner, categoryId} = req.body;
  try {
    const result = await Category.deleteOne({owner, _id: categoryId});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server is listening on port " + port);
});