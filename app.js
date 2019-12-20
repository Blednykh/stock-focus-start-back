const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const axios = require('axios');
const db = require('./db/db');

const app = express();
const userStocksRotues = require('./routes/userStocks');
const stocksRotues = require('./routes/stocks');
const transactionsRotues = require('./routes/transactions');
const usersRotues = require('./routes/users');

async function apiRequest(url) {
  const data = await axios.get(url);
  return data.data;
}


async function getStocksFromApi() {

  let newData = await apiRequest('https://financialmodelingprep.com/api/v3/stock/real-time-price');

  newData = { stockList: newData.stockList.filter((item, id) => id < 50) };
  const getStockProfile = (symbol) => {
    return axios
      .get(`https://financialmodelingprep.com/api/v3/company/profile/${symbol}`)
      .then((data) => data.data)
      .catch((err) => console.log('err', err));
  };
  newData.parts = [];
  for (let i = 0; i < newData.stockList.length; i += 25) {
    newData.parts.push(newData.stockList.slice(i, i + 25));
  }
  newData.parts.forEach((part, number) => {
    const timeoutFunction = (timeoutPart) => {
      Promise.all(timeoutPart.map(({ symbol }, id) => getStockProfile(symbol)))
        .then((res) => {
          res.forEach((resItem, id) => {
            if (resItem.symbol) {
              const stock = db.get('stocks')
                .find((item) => String(item.symbol) === resItem.symbol);

              let stockValue = stock.value();
              if (stockValue !== undefined) {
                stockValue = Object.assign(stockValue, resItem);
                stock.assign(stockValue)
                  .write();
              } else {
                db.get('stocks')
                  .push(resItem)
                  .write();
              }
            }
          });
        });
    };
    const timeout = setTimeout(timeoutFunction, number * 15000, part);
  });
}

getStocksFromApi();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(bodyParser.json());
app.use('/userstocks', userStocksRotues);
app.use('/stocks', stocksRotues);
app.use('/transactions', transactionsRotues);
app.use('/users', usersRotues);
app.use((err, req, res, next) => {
  const { message } = err;
  res.json({
    status: 'ERROR',
    message
  });
});

app.listen(8080, () => console.log('listening on port 8080'));
