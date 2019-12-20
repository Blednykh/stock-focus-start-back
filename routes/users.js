const express = require('express');
const { validate } = require('jsonschema');
const shortid = require('shortid');
const db = require('../db/db');
const router = express.Router();

router.post('/', (req, res, next) => {
  const { body } = req;
  const userShema = {
    type: 'object',
    properties: {
      newUser: { type: 'boolean' },
      userName: { type: 'string' },
      password: { type: 'string' },
    },
    required: ['newUser', 'userName', 'password'],
    additionalProperties: false
  };

  const validatorResult = validate(body, userShema);
  if (!validatorResult.valid) {
    return next(new Error('INVALID_JSON_OR_API_FORMAT'));
  }
  if (body.newUser) {
    const id = shortid.generate();
    const newUser = {
      userName: body.userName,
      password: body.password,
      stocks: [],
      transactions: [],
      id,
    };
    db.get('users')
      .push(newUser)
      .write();
    setTimeout(()=>{
      res.json({
        status: 'OK',
        data: id
      });
    }, 2000);
  } else {
    const user = db.get('users')
      .find((item) =>
        (String(item.userName) === body.userName) && (String(item.password) === body.password));
    if (user.value()) {
      setTimeout(()=>{
        res.json({
          status: 'OK',
          data: user.value().id,
        });
      }, 2000);
    } else {
      return next(new Error('Wrong login or password!'));
    }
  }
});
module.exports = router;
