const axios = require("axios");
const dotenv = require("dotenv");
const ethereumUtil = require("ethereumjs-util");
const fs = require("fs");
const { SimpleKeyring } = require('@unisat/bitcoin-simple-keyring')
const { verifyMessageSignatureRsv } = require('@stacks/encryption');

const accounts = require('../db/accounts');
const discords = require('../db/discords')
const collections = require('../db/collections');

dotenv.config();

const ADMIN = "bc1qakj552djms5p7gr3edp8we6rqaqqej970a2sal";

const EXPORT_OBJECT = {};
EXPORT_OBJECT.ADMIN = ADMIN;

EXPORT_OBJECT.resetLog = () => {
  fs.writeFile("log.log", content, (err) => {
    if (err) {
      console.error(err);
    }
    // done!
  });
};

EXPORT_OBJECT.writeLog = (contentString) => {
  fs.appendFile("log.log", contentString + "\n", (err) => {
    if (err) {
      console.error(err);
    }
    // done!
  });
};

EXPORT_OBJECT.signString = async (
  web3Obj,
  erc20Account,
  plainString = "Ordinal BTC Escrow"
) => {
  var msgHash = web3Obj.utils.keccak256(plainString);
  var signedString = "";
  try {
    await web3Obj.eth.personal.sign(
      web3Obj.utils.toHex(msgHash),
      erc20Account,
      function (err, result) {
        if (err) {
          EXPORT_OBJECT.writeLog(err);
          return {
            success: false,
            message: err,
          };
        }
        signedString = result;
        //console.log('SIGNED:' + result)
      }
    );
    return {
      success: true,
      message: signedString,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
};

EXPORT_OBJECT.getRecoverAddress = (plainData, signData) => {
  const messageHash = ethereumUtil.hashPersonalMessage(
    ethereumUtil.toBuffer(web3.utils.toHex(plainData))
  );
  const signatureBuffer = ethereumUtil.toBuffer(signData);
  const signatureParams = ethereumUtil.fromRpcSig(signatureBuffer);
  const publicKey = ethereumUtil.ecrecover(
    messageHash,
    signatureParams.v,
    signatureParams.r,
    signatureParams.s
  );
  const recoveredAddress = ethereumUtil.pubToAddress(publicKey).toString("hex");
  return `0x${recoveredAddress}`;
};

const getInscriptions = async (btcAccount) => {
  try {
    const response = await axios.get(
      `https://ordapi.xyz/address/${btcAccount}`
    );
    // console.log(response.data);
    return { result: true, data: response.data };
  } catch (error) {
    // console.log(error);
    EXPORT_OBJECT.writeLog("getInscriptions error");
    return { result: false, data: [] };
  }
};

EXPORT_OBJECT.getInscriptions = getInscriptions;

EXPORT_OBJECT.KIND_PLATINUM = 2;
EXPORT_OBJECT.KIND_GOLD = 1;
EXPORT_OBJECT.KIND_GENERAL = 0;

EXPORT_OBJECT.ROLE_PITBOSS = 20; // 20+
EXPORT_OBJECT.ROLE_SERGEANT = 10; // 10+
EXPORT_OBJECT.ROLE_OFFICERS = 5; // 5+
EXPORT_OBJECT.ROLE_METAZEN = 2; // 2+
EXPORT_OBJECT.ROLE_PIONEER = 1; // 1
EXPORT_OBJECT.ROLE_DWELLER = 0 // 0

EXPORT_OBJECT.SUCCESS = "SUCCESS";
EXPORT_OBJECT.FAIL = "FAIL";

EXPORT_OBJECT.checkRole = async (accessToken, discordServerId) => {
  try {
    const accountItem = await accounts.findOne({ accessToken: accessToken, discordServerId: discordServerId })
    const collectionIdItem = await discords.findOne({ discordServerId: discordServerId })
    const collectionItems = await collections.find({ id: collectionIdItem.id })
    const inscriptions = await getInscriptions(accountItem.address);

    if (!inscriptions.result)
      return { version: EXPORT_OBJECT.ROLE_DWELLER, kind: EXPORT_OBJECT.KIND_GENERAL }

    const nCount = 0;
    const version = EXPORT_OBJECT.ROLE_DWELLER;
    const kind = EXPORT_OBJECT.KIND_GENERAL;
    for (let inscription in inscriptions) {
      const items = collectionItems.filter((item) => item.inscription === inscription)
      if (items.length > 0) {
        nCount++;
        items.map((item) => {
          if (item.inscriptionType > kind) {
            kind = item.inscriptionType;
          }
        })
      }
    }

    if (version > EXPORT_OBJECT.ROLE_PITBOSS) {
      version = EXPORT_OBJECT.ROLE_PITBOSS;
    } else if (version > EXPORT_OBJECT.ROLE_SERGEANT) {
      version = EXPORT_OBJECT.ROLE_SERGEANT;
    } else if (version > EXPORT_OBJECT.ROLE_OFFICERS) {
      version = EXPORT_OBJECT.ROLE_OFFICERS;
    } else if (version > EXPORT_OBJECT.ROLE_METAZEN) {
      version = EXPORT_OBJECT.ROLE_METAZEN;
    }

    return { version: version, kind: kind }
  } catch (error) {
    console.log('error: ', error)
    return { version: EXPORT_OBJECT.ROLE_DWELLER, kind: EXPORT_OBJECT.KIND_GENERAL }
  }
}

EXPORT_OBJECT.delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const verifyMessage = async (publicKey, text, sig) => {
  const keyring = new SimpleKeyring();
  return keyring.verifyMessage(publicKey, text, sig);
}

const verifyMessageHiro = async (publicKey, text, sig) => {
  return verifyMessageSignatureRsv({ message: text, publicKey, signature: sig });
}

EXPORT_OBJECT.verifyMessage = verifyMessage
EXPORT_OBJECT.verifyMessageHiro = verifyMessageHiro

module.exports = EXPORT_OBJECT;
