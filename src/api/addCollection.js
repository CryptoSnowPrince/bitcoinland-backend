const { getAddressInfo, Network } = require('bitcoin-address-validation');
const collections = require('../db/collections');
const { SUCCESS, FAIL, checkRole, verifyMessage, verifyMessageHiro } = require('../utils')

module.exports = async (req_, res_) => {
    try {

        console.log("setUserInfo: ", req_.body);
        const id = req_.body.accessToken
        const action = req_.body.action
        const inscriptionInfos = req_.body.inscriptionInfos
        const address = req_.body.address
        const publicKey = req_.body.publicKey
        const signature = req_.body.signature

        if (
            !id ||
            !action ||
            !inscriptionInfos ||
            !address ||
            !publicKey ||
            !signature ||
            getAddressInfo(address).network !== Network.mainnet ||
            !getAddressInfo(address).bech32
        ) {
            console.log("false: ", !id)
            console.log("false: ", !action)
            console.log("false: ", !inscriptionInfos)
            console.log("false: ", !address)
            console.log("false: ", !publicKey)
            console.log("false: ", !signature)
            console.log("false: ", getAddressInfo(address).network !== Network.mainnet)
            console.log("false: ", !getAddressInfo(address).bech32)
            return res_.send({ result: false, status: FAIL, message: "params fail" });
        }

        // verify signature
        let retVal = false
        switch (wallet) {
            case 'Unisat':
                retVal = await verifyMessage(publicKey, SIGN_TEXT, signature)
                break;
            case 'Xverse':
            case 'Hiro':
                retVal = await verifyMessageHiro(publicKey, SIGN_TEXT, signature)
                break;
            default:
                break;
        }
        console.log("verifyMessage retVal: ", retVal);
        if (!retVal) {
            return res_.send({ result: { version: ROLE_DWELLER, kind: KIND_GENERAL }, status: FAIL, message: "signature fail" });
        }

        const { version, kind } = await checkRole(accessToken, discordServerId);

        const fetchItem = await accounts.findOne({ accessToken: accessToken, discordServerId: discordServerId });
        //console.log("fetchItem: ", fetchItem);
        if (fetchItem) {
            // update last loginTime
            const _updateResult = await accounts.updateOne({ accessToken: accessToken, discordServerId: discordServerId }, {
                address: address,
                publicKey: publicKey,
                roleVersion: version,
                roleKind: kind,
                lastUpdateDate: Date.now(),
                lastLoginDate: Date.now()
            });

            if (!_updateResult) {
                console.log("updateOne fail!", _updateResult);
                return res_.send({ result: false, status: FAIL, message: "update fail" });
            }
            return res_.send({ result: fetchItem, status: SUCCESS, message: "update success" });
        } else {
            const accountItem = new accounts({
                accessToken: accessToken,
                discordServerId: discordServerId,
                address: address,
                publicKey: publicKey,
                roleVersion: version,
                roleKind: kind,
                firstLoginDate: Date.now(),
                lastUpdateDate: Date.now(),
                lastLoginDate: Date.now(),
            })

            const saveItem = await accountItem.save();
            if (!saveItem) {
                console.log("save fail!", saveItem);
                return res_.send({ result: false, status: FAIL, message: "save fail" });
            }
            return res_.send({ result: saveItem, status: SUCCESS, message: "save success" });
        }
    } catch (error) {
        console.log('something went wrong', error)
        return res_.send({ result: false, status: FAIL, message: "something went wrong" });
    }
}
