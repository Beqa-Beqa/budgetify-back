// Require mongoose package to communicate with mongoDb.
const mongoose = require("mongoose");

// Connect to mongoDb with it's connection string.
mongoose.connect(process.env.MONGO_URI);

const obligatorySchema = new mongoose.Schema({
  belongsToAccountWithId: {
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
    default: "0.00"
  },
  dateRange: {
    type: [Date | null],
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  createdOn: {
    type: String,
    default: ""
  }
});

const piggyBankPaymentSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  }
});

// piggy bank chema.
const piggyBankSchema = new mongoose.Schema({
  belongsToAccountWithId: {
    type: String,
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  goalAmount: {
    type: String,
    required: true,
  },
  currentAmount: {
    type: String,
    default: "0.00"
  },
  payments: {
    type: [piggyBankPaymentSchema],
    default: []
  }
});

// subscription schema.
const subscriptionSchema = new mongoose.Schema({
  creationDate: {
    type: String,
    required: true,
    default: ""
  },
  year: {
    type: Number,
    required: true
  },
  months: {
    type: [Number],
    required: true
  },
  belongsToAccountWithId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  chosenCategories: {
    type: [String],
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  dateRange: {
    type: [Date | null],
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  }
});

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

// transaction attachment file schema.
const transactionFileSchema = new mongoose.Schema({
  belongsToTransactionWithId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  data: {
    type: Buffer,
    required: true
  }
});

// Acount transaction schema.
const transactionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },

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
  },

  files: {
    type: [transactionFileSchema],
    default: []
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
// Create subscription model and name it "subscriptions" - (collection) based on subscription schema.
const Subscription = mongoose.model("subscriptions", subscriptionSchema);
// Create piggy bank model and name it "piggybanks" - (collection) based on piggy bank schema.
const PiggyBank = mongoose.model("piggybanks", piggyBankSchema);
// files model
const File = mongoose.model("files", transactionFileSchema);
// obligatory
const Obligatory = mongoose.model("obligatories", obligatorySchema);

// export Credential model with commonJS syntax.
module.exports = {Credential, Account, Transaction, Category, Subscription, PiggyBank, File, Obligatory};