const { getAddressInfo, Network } = require('bitcoin-address-validation');
const discords = require('../db/discords');
const { SUCCESS, FAIL, verifyMessage, verifyMessageHiro, ADMIN } = require('../utils')

module.exports = async (req_, res_) => {
    try {

        console.log("registerServer: ", req_.body);
        const address = req_.body.address
        const discordServerId = req_.body.discordServerId
        const collectionId = req_.body.collectionId
        const date = req_.body.date
        const publicKey = req_.body.publicKey
        const signature = req_.body.signature

        if (
            !address ||
            !discordServerId ||
            !collectionId ||
            !date ||
            !publicKey ||
            !signature ||
            getAddressInfo(address).network !== Network.mainnet ||
            !getAddressInfo(address).bech32
        ) {
            console.log("false: ", !address)
            console.log("false: ", !discordServerId)
            console.log("false: ", !collectionId)
            console.log("false: ", !date)
            console.log("false: ", !publicKey)
            console.log("false: ", !signature)
            if (address) {
                console.log("false: ", getAddressInfo(address).network !== Network.mainnet)
                console.log("false: ", !getAddressInfo(address).bech32)
            }
            return res_.send({ result: false, status: FAIL, message: "params fail" });
        }

        // verify signature
        const data = {
            address: address,
            discordServerId: discordServerId,
            collectionId: collectionId,
            date: date,
            publicKey: publicKey
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

        const fetchItem = await discords.findOne({ discordServerId: discordServerId });
        //console.log("fetchItem: ", fetchItem);
        if (fetchItem) {
            if (fetchItem.actionDate > date) {
                return res_.send({ result: false, status: FAIL, message: "old sign date" });
            }
            const _updateResult = await discords.updateOne({ discordServerId: discordServerId }, {
                discordServerId: discordServerId,
                collectionId: collectionId,
                actionDate: Date.now()
            });

            if (!_updateResult) {
                console.log("updateOne fail!", _updateResult);
                return res_.send({ result: false, status: FAIL, message: "update fail" });
            }
            return res_.send({ result: true, status: SUCCESS, message: "update success" });
        } else {
            const discordItem = new discords({
                discordServerId: discordServerId,
                collectionId: collectionId,
                actionDate: Date.now(),
            })

            const saveItem = await discordItem.save();
            if (!saveItem) {
                console.log("save fail!", saveItem);
                return res_.send({ result: false, status: FAIL, message: "save fail" });
            }
            return res_.send({ result: true, status: SUCCESS, message: "save success" });
        }
    } catch (error) {
        console.log('something went wrong', error)
        return res_.send({ result: false, status: FAIL, message: "something went wrong" });
    }
}
