const express = require('express');
const db = require('../db/db');
const router = express.Router();

router.get('/', (req, res, next) => {
  const { offset, name } = req.query;
  let stocks;
  if (!name || name === '') {
    stocks = db.get('stocks')
      .filter((item, id) => id >= offset && id < Number(offset) + 10);
  } else {
    stocks = db.get('stocks')
      .filter((stock) => stock.symbol.toLowerCase()
          .indexOf(name.toLowerCase()) !== -1 ||
        stock.profile.companyName.toLowerCase()
          .indexOf(name.toLowerCase()) !== -1)
      .filter((item, id) => id >= offset && id < Number(offset) + 10);
  }
  res.json({
    status: 'OK',
    data: stocks
  });
});

router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const data = db.get('stocks')
    .find((stock) => String(stock.symbol) === id);
  res.json({
    status: 'OK',
    data: data
  });
});

module.exports = router;
