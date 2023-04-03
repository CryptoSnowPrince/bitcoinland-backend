const axios = require("axios");
const dotenv = require("dotenv");
const ethereumUtil = require("ethereumjs-util");
const fs = require("fs");

dotenv.config();

const EXPORT_OBJECT = {};

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

EXPORT_OBJECT.getInscriptions = async (btcAccount) => {
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

EXPORT_OBJECT.SUCCESS = "SUCCESS";
EXPORT_OBJECT.FAIL = "FAIL";

EXPORT_OBJECT.getDisplayString = (str, subLength1 = 8, subLength2 = 8) => {
  return `${str.toString().substr(0, subLength1)}...${str
    .toString()
    .substr(str.length - subLength2, str.length)}`;
};

EXPORT_OBJECT.timeEstimate = (feeRate) => {
  const feeRateValue = parseFloat(feeRate);
  if (feeRateValue < 8) {
    return ">1 hour";
  } else if (feeRateValue < 10) {
    return "~1 hour";
  } else if (feeRateValue >= 10) {
    return "~15 minutes";
  }
  return "Can't Estimate";
};

EXPORT_OBJECT.delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

module.exports = EXPORT_OBJECT;
