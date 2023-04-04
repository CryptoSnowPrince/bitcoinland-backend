const express = require('express');
const router = express.Router();

const getAccountInfo = require("./getAccountInfo");
const setAccountInfo = require("./setAccountInfo");
const addCollection = require("./addCollection");
const registerServer = require("./registerServer");

// getAccountInfo
router.get('/getAccountInfo', getAccountInfo);

// setAccountInfo
router.post('/setAccountInfo', setAccountInfo);

// addCollection
router.post('/addCollection', addCollection);

// registerServer
router.post('/registerServer', registerServer);

module.exports = router;