const { getAddressInfo, Network } = require('bitcoin-address-validation');
const collections = require('../db/collections');
const { SUCCESS, FAIL, verifyMessage, verifyMessageHiro, ADMIN } = require('../utils')

const addItem = async (id, inscription, inscriptionType, date) => {
    const fetchItem = await collections.findOne({
        id: id,
        inscription: inscription
    });
    //console.log("fetchItem: ", fetchItem);
    if (fetchItem) {
        if (fetchItem.actionDate > date) {
            return -1; // old sign
        }
        const _updateResult = await collections.updateOne({
            id: id,
            inscription: inscription
        }, {
            inscriptionType: inscriptionType,
            actionDate: Date.now()
        });

        if (!_updateResult) {
            console.log("updateOne fail!", _updateResult);
            return -2; // update fail
        }
        return 0; // true
    } else {
        const collectionItem = new collections({
            id: id,
            inscription: inscription,
            inscriptionType: inscriptionType,
            actionDate: Date.now(),
        })

        const saveItem = await collectionItem.save();
        if (!saveItem) {
            console.log("save fail!", saveItem);
            return -3; // save fail
        }
        return 2; // save success
    }
}

module.exports = async (req_, res_) => {
    try {

        console.log("addCollection: ", req_.body);
        const address = req_.body.address
        const id = req_.body.id
        const inscriptionInfos = req_.body.inscriptionInfos
        const publicKey = req_.body.publicKey
        const date = req_.body.date
        const signature = req_.body.signature

        if (
            !address ||
            !id ||
            !inscriptionInfos ||
            !publicKey ||
            !date ||
            !signature ||
            getAddressInfo(address).network !== Network.mainnet ||
            !getAddressInfo(address).bech32
        ) {
            console.log("false: ", !address)
            console.log("false: ", !id)
            console.log("false: ", !inscriptionInfos)
            console.log("false: ", !publicKey)
            console.log("false: ", !date)
            console.log("false: ", !signature)
            console.log("false: ", getAddressInfo(address).network !== Network.mainnet)
            console.log("false: ", !getAddressInfo(address).bech32)
            return res_.send({ result: false, status: FAIL, message: "params fail" });
        }

        const inscriptions = JSON.parse(inscriptionInfos);
        if (!inscriptions && inscriptions.length <= 0) {
            return res_.send({ result: false, status: FAIL, message: "empty data" });
        }

        // verify signature
        const data = {
            address: address,
            id: id,
            publicKey: publicKey,
            date: date
        }

        let retVal = false
        switch (wallet) {
            case 'Unisat':
                retVal = await verifyMessage(publicKey, JSON.stringify(data), signature)
                break;
            case 'Xverse':
            case 'Hiro':
                retVal = await verifyMessageHiro(publicKey, JSON.stringify(data), signature)
                break;
            default:
                break;
        }
        console.log("verifyMessage retVal: ", retVal);
        if (!retVal) {
            return res_.send({ result: false, status: FAIL, message: "signature fail" });
        }

        // verify admin
        if (ADMIN !== address) {
            return res_.send({ result: false, status: FAIL, message: "not admin" });
        }

        // add collections
        for (item in inscriptions) {
            const retVal = await addItem(id, item.inscription, item.inscriptionType, date)
            if (retVal < 0) {
                return res_.send({ result: retVal, status: FAIL, message: "something went wrong while addItem" });
            }
        }
        return res_.send({ result: true, status: SUCCESS, message: "update success" });
    } catch (error) {
        console.log('something went wrong', error)
        return res_.send({ result: false, status: FAIL, message: "something went wrong" });
    }
}
