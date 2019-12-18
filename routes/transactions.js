const express = require('express');
const { validate } = require('jsonschema');
const shortid = require('shortid');
const db = require('../db/db');
const router = express.Router();
const axios = require('axios');


router.get('/', (req, res, next) => {
  const {offset, name} = req.query;
  let transactions;
  if (!name || name === '') {
    transactions = db.get('transactionHistory')
      .filter((item, id) => id >= offset && id < Number(offset) + 10);
  } else {
    transactions = db.get('transactionHistory')
      .filter((transaction) => transaction.symbol.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        transaction.profile.companyName.toLowerCase().indexOf(name.toLowerCase()) !== -1)
      .filter((item, id) => id >= offset && id < Number(offset) + 10);
  }
  res.json({
    status: 'OK',
    data: transactions
  });
});

module.exports = router;
