// Require mongoose package to communicate with mongoDb.
const mongoose = require("mongoose");

// Connect to mongoDb with it's connection string.
mongoose.connect(process.env.MONGO_URI);

// User accounts schema.
const accountsSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true
  },

  title: {
    type: String,
    required: true,
  },

  currency: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true,
    default: 0
  },

  description: {
    type: String
  }
});

// User data schema for mongoose credential schema.
const userData = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

// Credential schema for mongoose.
const credentialsSchema = new mongoose.Schema({
  // It must have email (required: true), it is string (type: String), it is unique (unique: true).
  email: {
    type: String,
    required: true,
    unique: true
  },

  // It must have password (required: true), it is string (type: String).
  password: {
    type: String,
    required: true
  },
  
  data: {
    type: userData,
    required: true
  }
});

// Create credential model and name it "credentials" - (collection) based on crdential schema.
const Credential = mongoose.model("credentials", credentialsSchema);
// Create account model and name it "accounts" - (collection) based on crdential schema.
const Account = mongoose.model("accounts", accountsSchema)

// export Credential model with commonJS syntax.
module.exports = {Credential, Account};