const express = require('express');
const db = require('../db/db');
const router = express.Router();

router.get('/', (req, res, next) => {
  const { offset, name, userId } = req.query;
  let transactions;
  let user = db.get('users')
    .find((item) => item.id === userId);
  if (!name || name === '') {
    transactions = user.value()
      .transactions
      .filter((item, id) => id >= offset && id < Number(offset) + 10);
  } else {
    transactions = user.value()
      .transactions
      .filter((transaction) => transaction.symbol.toLowerCase()
          .indexOf(name.toLowerCase()) !== -1 ||
        transaction.profile.companyName.toLowerCase()
          .indexOf(name.toLowerCase()) !== -1)
      .filter((item, id) => id >= offset && id < Number(offset) + 10);
  }

  transactions = transactions.map((item) => {
    const stock = db.get('stocks')
      .find((stocksItem) => stocksItem.symbol === item.symbol)
      .value().profile;
    return {
      ...item,
      profile: {
        companyName: stock.companyName,
        image: stock.image,
        description: stock.description,
        changes: stock.changes,
        changesPercentage: stock.changesPercentage,
        price: stock.price
      }
    };
  });

  res.json({
    status: 'OK',
    data: transactions
  });
});

module.exports = router;
