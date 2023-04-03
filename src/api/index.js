const express = require('express');
const router = express.Router();

const getAccountInfo = require("./getAccountInfo");
const setAccountInfo = require("./setAccountInfo");

// getAccountInfo
router.get('/getAccountInfo', getAccountInfo);

// setAccountInfo
router.get('/setAccountInfo', setAccountInfo);

module.exports = router;