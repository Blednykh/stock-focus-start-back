const express = require('express');
const { validate } = require('jsonschema');
const db = require('../db/db');
const router = express.Router();

router.get('/', (req, res, next) => {
  const { offset, name, userId } = req.query;
  let stocks;
  let user = db.get('users')
    .find((item) => item.id === userId);
  if (!name || name === '') {
    stocks = user.value()
      .stocks
      .filter((item, id) => id >= offset && id < Number(offset) + 10);
  } else {
    stocks = user.value()
      .stocks
      .filter((stock) =>
        stock.symbol.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        db.get('stocks')
          .find((stocksItem) => stocksItem.symbol === stock.symbol)
          .value().profile.companyName.toLowerCase()
          .indexOf(name.toLowerCase()) !== -1
       )
      .filter((item, id) => id >= offset && id < Number(offset) + 10);
  }
  stocks = stocks.map((item) => {
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
    data: stocks
  });
});


router.get('/:id', (req, res, next) => {
  const { userId } = req.query;
  const { id } = req.params;
  const user = db.get('users')
    .find((item) => item.id === userId);
  let data = user.value()
    .stocks
    .find((stock) => String(stock.symbol) === id);

  const stock = db.get('stocks')
    .find((stocksItem) => stocksItem.symbol === data.symbol)
    .value().profile;
  data.profile = {
    companyName: stock.companyName,
    image: stock.image,
    description: stock.description,
    changes: stock.changes,
    changesPercentage: stock.changesPercentage,
    price: stock.price
  };
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
      type: { type: 'string' },
      userId: { type: 'string' }
    },
    required: ['symbol', 'count', 'price', 'type', 'userId'],
    additionalProperties: false
  };

  const validatorResult = validate(body, stockShema);
  if (!validatorResult.valid) {
    return next(new Error('INVALID_JSON_OR_API_FORMAT'));
  }

  const user = db.get('users')
    .find((item) => item.id === body.userId);

  const { stocks } = user.value();
  const index = stocks.findIndex((item) => String(item.symbol) === body.symbol);

  if (index !== -1) {
    if (body.type === 'buy') {
      stocks[index].middlePrice =
        (stocks[index].count * stocks[index].middlePrice + body.count * body.price)
        / (stocks[index].count + body.count);
      stocks[index].count += body.count;
    } else {
      stocks[index].middlePrice = (stocks[index].count * stocks[index].middlePrice - body.count * body.price)
        / (stocks[index].count - body.count);
      stocks[index].count -= body.count;
    }
    try {
      if(stocks[index].count === 0){
        stocks.splice(index, 1);
      }
      user.assign({ stocks: stocks })
        .write();
    } catch (err) {
      throw new Error(err);
    }
    res.json({
      status: 'OK',
      data: stocks[index]
    });
  } else {
    const newStock = {
      symbol: body.symbol,
      count: body.count,
      middlePrice: body.price,
    };
    try {
      stocks.push(newStock);
      user.assign({ stocks: stocks })
        .write();
    } catch (err) {
      throw new Error(err);
    }
    res.json({
      status: 'OK',
      data: newStock
    });
  }

  const { transactions } = user.value();
  const nowDate = new Date();
  const newTransaction = {
    symbol: body.symbol,
    transactionCount: body.count,
    date: nowDate,
    transactionPrice: body.price,
    type: body.type,
    profile: {}
  };
  transactions.push(newTransaction);
  user.assign({ transactions: transactions })
    .write();
});

module.exports = router;
