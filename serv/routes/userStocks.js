const express = require('express');
const { validate } = require('jsonschema');
const shortid = require('shortid');
const db = require('../db/db');
const router = express.Router();
const axios = require('axios');


router.get('/', (req, res, next) => {
  const stocks = db.get('userStocks').filter((item, id) => id >= req.query.offset && id < Number(req.query.offset) + 5);;
  res.json({
    status: 'OK',
    data: stocks
  });
});


router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const data = db.get('userStocks').find((stock) => String(stock.id) === id);
  res.json({
    status: 'OK',
    data: data
  });
});

router.post('/', (req, res, next) => {
  const { body } = req;

  const stockShema = {
    type: 'object',
    properties: {
      symbol: { type: 'string' },
      count: { type: 'number' },
      price: { type: 'number' },
      type: { type: 'string' }
    },
    required: ['symbol', 'count', 'price', 'type'],
    additionalProperties: false
  };

  const validatorResult = validate(body, stockShema);
  if (!validatorResult.valid) {
    return next(new Error('INVALID_JSON_OR_API_FORMAT'));
  }

  /* const id = shortid.generate();*/
  /* let stock = db.get('stocks').value();
   console.log("stock", stock);
   let stockIndex = stock.findIndex(item=>{
     String(item.id) === body.id;
   });*/
  let stock = db.get('userStocks')
    .find((item) => String(item.symbol) === body.symbol);
  let stockValue = stock.value();
  if (stockValue !== undefined) {
    if (body.type === 'buy') {
      stockValue.middlePrice = (stockValue.count * stockValue.middlePrice + body.count * body.price) / (stockValue.count + body.count);
      stockValue.count += body.count;
    }
    else {
      stockValue.middlePrice = (stockValue.count * stockValue.middlePrice - body.count * body.price) / (stockValue.count - body.count);
      stockValue.count -= body.count;
    }
    try {
      stock.assign(stockValue).write();
    } catch (err) {
      throw new Error(err);
    }
    res.json({
      status: 'OK',
      data: stock
    });
  }
  else{
    const newStock = {
      symbol: body.symbol,
      count: body.count,
      middlePrice: body.price,
      profile: db.get('stocks')
        .find((item) => item.symbol === body.symbol).value().profile
    };
    try {
      db.get('userStocks')
        .push(newStock)
        .write();
    } catch (err) {
      throw new Error(err);
    }
    res.json({
      status: 'OK',
      data: newStock
    });
  }
  const nowDate = new Date();
  const newTransaction = {
    stockId: body.symbol,
    count: body.count,
    date: nowDate,
    price: body.price,
    type: body.type,
    profile: db.get('stocks')
      .find((item) => item.symbol === body.symbol).value().profile
  };
  db.get('transactionHistory')
    .push(newTransaction)
    .write();
});

module.exports = router;
