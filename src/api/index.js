const express = require('express');
const router = express.Router();

const getAccountInfo = require("./getAccountInfo");
const setAccountInfo = require("./setAccountInfo");
const addCollection = require("./addCollection");
const registerServer = require("./registerServer");

// getAccountInfo
router.get('/getAccountInfo', getAccountInfo);

// setAccountInfo
router.get('/setAccountInfo', setAccountInfo);

// addCollection
router.get('/addCollection', addCollection);

// registerServer
router.get('/registerServer', registerServer);

module.exports = router;