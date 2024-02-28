// Require mongoose package to communicate with mongoDb.
const mongoose = require("mongoose");

// Connect to mongoDb with it's connection string.
mongoose.connect(process.env.MONGO_URI);

// category schema.
const categorySchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true
  },
  transactionType: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
});

// Acount transaction schema.
const transactionSchema = new mongoose.Schema({
  belongsToAccountWithId: {
    type: String,
    required: true
  },

  transactionType: {
    type: String,
    required: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  amount: {
    type: String,
    required: true
  },

  date: {
    type: String,
    required: true
  },

  payee: {
    type: String,
    default: ""
  },

  chosenCategories: {
    type: [String],
    required: true
  },

  creationDate: {
    type: String,
    required: true
  },

  updateDate: {
    type: String,
    required: true
  }
});

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
    type: String,
    required: true
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
// Create account model and name it "accounts" - (collection) based on accounts schema.
const Account = mongoose.model("accounts", accountsSchema)
// Create transaction model and name it "transactions" - (collection) based on transactions schema.
const Transaction = mongoose.model("transactions", transactionSchema);
// Create category model and name it "categories" - (collection) based on category schema.
const Category = mongoose.model("categories", categorySchema);

// export Credential model with commonJS syntax.
module.exports = {Credential, Account, Transaction, Category};