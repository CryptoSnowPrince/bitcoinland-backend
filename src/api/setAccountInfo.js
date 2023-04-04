const { getAddressInfo, Network } = require('bitcoin-address-validation');
const accounts = require('../db/accounts');
const { SUCCESS, FAIL, checkRole, verifyMessage, SIGN_TEXT, KIND_GENERAL, ROLE_DWELLER, verifyMessageHiro } = require('../utils')

module.exports = async (req_, res_) => {
    try {

        console.log("setAccountInfo: ", req_.body);
        const accessToken = req_.body.accessToken
        const discordServerId = req_.body.discordServerId
        const address = req_.body.address
        const publicKey = req_.body.publicKey
        const wallet = req_.body.wallet
        const signature = req_.body.signature

        if (
            !accessToken ||
            !discordServerId ||
            !address ||
            !wallet ||
            !publicKey ||
            !signature ||
            getAddressInfo(address).network !== Network.mainnet ||
            !getAddressInfo(address).bech32
        ) {
            console.log("false: ", !accessToken)
            console.log("false: ", !discordServerId)
            console.log("false: ", !address)
            console.log("false: ", !wallet)
            console.log("false: ", !publicKey)
            console.log("false: ", !signature)
            console.log("false: ", getAddressInfo(address).network !== Network.mainnet)
            console.log("false: ", !getAddressInfo(address).bech32)
            return res_.send({ result: { version: ROLE_DWELLER, kind: KIND_GENERAL }, status: FAIL, message: "params fail" });
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
        // console.log("fetchItem: ", fetchItem, version, kind);
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
                return res_.send({ result: { version: ROLE_DWELLER, kind: KIND_GENERAL }, status: FAIL, message: "update fail" });
            }
            return res_.send({
                result:
                {
                    version: version,
                    kind: kind
                },
                tatus: SUCCESS,
                message: "update success"
            });
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
                return res_.send({
                    result:
                    {
                        version: ROLE_DWELLER,
                        kind: KIND_GENERAL
                    },
                    status: FAIL,
                    message: "save fail"
                });
            }
            return res_.send({ result: { version: version, kind: kind }, status: SUCCESS, message: "save success" });
        }
    } catch (error) {
        console.log('something went wrong', error)
        return res_.send({ result: { version: ROLE_DWELLER, kind: KIND_GENERAL }, status: FAIL, message: "something went wrong" });
    }
}
