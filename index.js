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
const {Credential, Account, Transaction, Category, Subscription, PiggyBank, File, Obligatory} = require("./db/connect");
const multer = require("multer");
const upload = multer({storage: multer.memoryStorage()});

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
    // Fetch current user's subscriptions data.
    const subscriptionsResponse = await Subscription.find({belongsToAccountWithId: {$in: accountsIds}});
    // Fetch current user's piggy banks data.
    const piggyBanksResponse = await PiggyBank.find({belongsToAccountWithId: {$in: accountsIds}});
    // Fetch current user's obligatories data.
    const obligatoriesResponse = await Obligatory.find({belongsToAccountWithId: {$in: accountsIds}});
    // Send status code 200 and response json.
    res.status(200).json({
      credentialRes: credentialResponse,
      accountsData: accountsResponse,
      transactionsData: transanctionResponse,
      categoriesData: categoriesResponse,
      subscriptionsData: subscriptionsResponse,
      piggyBanksData: piggyBanksResponse,
      obligatoryData: obligatoriesResponse
    })
  }catch (err){
    // If error, send status code 500 and message with err.message
    res.status(500).json({
      message: err.message
    });
  }
});

// Accounts

app.post("/create-account", async (req,res) => {
  try {
    // destructure request body.
    const {userId, accountData} = req.body;
    const {title, currency, description, amount} = accountData;

    // get current time
    const currentEnvTime = new Date();
    const currentEnvTimeInUnixString = currentEnvTime.getTime().toString();

    // createa ccount.
    const result = await Account.create({
      owner: userId,
      title,
      currency,
      amount: amount || "0",
      description,
      creationDate: currentEnvTimeInUnixString
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

// Transactions

app.post("/create-transaction", upload.any(), async (req,res) => {
  try {
    const {id, belongsToAccountWithId, transactionType, title, description, amount, date, chosenCategories, payee} = req.body;
    const currentEnvTimeInUnixString = new Date().getTime().toString();
    // const files = req.files;
    // if(files) {
    //   files.forEach(async (file) => {
    //     const buffer = Buffer.from(file.buffer);
    //     await File.create({
    //       belongsToTransactionWithId: id,
    //       name: file.originalname,
    //       type: file.mimetype,
    //       size: file.size,
    //       data: buffer
    //     });
    //   });
    // }

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
      creationDate: currentEnvTimeInUnixString,
      updateDate: currentEnvTimeInUnixString,
      files: []
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
    // const filesPathArray = req.files && req.files.map((file) => {return {name: file.originalname, path: file.path, type: file.mimetype, size: file.size}});
    // if(filesPathArray) fields.files = filesPathArray;

    // removeFilesFromUploadsIfNotIncluded(__dirname, id, filesPathArray);
    // removeEmptyFoldersFromUploads(__dirname);

    const result = await Transaction.findOneAndUpdate({id: transactionId, belongsToAccountWithId: belongsToId}, {...fields, updateDate: currentEnvTimeInUnix}, {returnDocument: "after"});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

app.post("/delete-transaction", async (req,res) => {
  try {
    const {transactionId, belongsToId} = req.body;
    const result = await Transaction.deleteOne({id: transactionId, belongsToAccountWithId: belongsToId});
    // fs.rmSync(`uploads/${transactionId}`, {recursive: true, force: true});
    // removeEmptyFoldersFromUploads();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Categories

app.post("/create-category", async (req,res) => {
  try {
    const {owner, title, transactionType} = req.body;
    const result = await Category.create({owner, title, transactionType});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.patch("/edit-category", async (req,res) => {
  try {
    const {owner, categoryId, fields} = req.body.infoForEdit;
    const result = await Category.findOneAndUpdate({owner, _id: categoryId}, fields, {returnDocument: "after"});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.post("/delete-category", async (req,res) => {
  try {
    const {owner, categoryId} = req.body;
    const result = await Category.deleteOne({owner, _id: categoryId});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// Subscriptions

app.post("/create-subscription", async (req,res) => {
  try {
    const {belongsToAccountWithId, title, chosenCategories, amount, dateRange, startDate, endDate, description} = req.body;
    const currentEnvTime = new Date();
    const currentEnvTimeInUnixString = currentEnvTime.getTime().toString();
    const year = currentEnvTime.getFullYear();
    const result = await Subscription.create({creationDate: currentEnvTimeInUnixString, year, months: [], belongsToAccountWithId, title, chosenCategories, amount, dateRange, startDate, endDate, description});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.patch("/edit-subscription", async (req,res) => {
  try {
    const {subscriptionId, belongsToAccountWithId, fields} = req.body;
    const result = await Subscription.findOneAndUpdate({_id: subscriptionId, belongsToAccountWithId}, fields, {returnDocument: "after"});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/delete-subscription", async (req,res) => {
  try {
    const {subscriptionId, belongsToAccountWithId} = req.body;
    const result = await Subscription.deleteOne({_id: subscriptionId, belongsToAccountWithId});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
}); 

// Piggy banks

app.post("/create-piggy-bank", async (req,res) => {
  try {
    const {belongsToAccountWithId, goal, goalAmount} = req.body;
    const result = await PiggyBank.create({belongsToAccountWithId, goal, goalAmount});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.patch("/edit-piggy-bank", async (req,res) => {
  try {
    const {belongsToAccountWithId, piggyBankId, fields} = req.body;
    const result = await PiggyBank.findOneAndUpdate({_id: piggyBankId, belongsToAccountWithId}, fields, {returnDocument: "after"});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/delete-piggy-bank", async (req,res) => {
  try {
    const {belongsToAccountWithId, piggyBankId} = req.body;
    const result = await PiggyBank.deleteOne({_id: piggyBankId, belongsToAccountWithId});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Obligatories

app.post("/create-obligatory", async (req,res) => {
  try {
    const currentEnvTime = new Date();
    const currentEnvTimeInUnixString = currentEnvTime.getTime().toString();
    const year = currentEnvTime.getFullYear();
    const {belongsToAccountWithId, title, description, amount, dateRange, startDate, endDate} = req.body;
    const result = await Obligatory.create({
      year, months: [], belongsToAccountWithId, title, description,
      amount, dateRange, startDate, endDate, createdOn: currentEnvTimeInUnixString
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.patch("/edit-obligatory", async (req,res) => {
  try {
    const {belongsToAccountWithId, obligatoryId, fields} = req.body;
    const result = await Obligatory.findOneAndUpdate({_id: obligatoryId, belongsToAccountWithId}, fields, {returnDocument: "after"});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/delete-obligatory", async (req,res) => {
  try {
    const {belongsToAccountWithId, obligatoryId} = req.body;
    const result = await Obligatory.findOneAndDelete({_id: obligatoryId, belongsToAccountWithId});
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server is listening on port " + port);
});