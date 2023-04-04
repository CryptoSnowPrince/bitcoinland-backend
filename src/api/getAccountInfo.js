const accounts = require('../db/accounts');
const { SUCCESS, FAIL, checkRole, KIND_GENERAL, ROLE_DWELLER } = require('../utils')

module.exports = async (req_, res_) => {
    try {
        console.log("getAccountInfo: ", req_.query);
        const accessToken = req_.query.accessToken;
        const discordServerId = req_.query.discordServerId;

        if (
            !accessToken ||
            !discordServerId
        ) {
            console.log("false: ", !accessToken)
            console.log("false: ", !discordServerId)
            return res_.send({ result: { version: ROLE_DWELLER, kind: KIND_GENERAL }, status: FAIL, message: "params fail" });
        }

        const { version, kind } = await checkRole(accessToken, discordServerId);

        const fetchItem = await accounts.findOne({ accessToken: accessToken, discordServerId: discordServerId });
        //console.log("fetchItem: ", fetchItem);
        if (fetchItem) {
            // update last loginTime
            const _updateResult = await accounts.updateOne({ accessToken: accessToken, discordServerId: discordServerId }, {
                roleVersion: version,
                roleKind: kind,
                lastUpdateDate: Date.now(),
                lastLoginDate: Date.now()
            });

            if (!_updateResult) {
                console.log("updateOne fail!", _updateResult);
                return res_.send({ result: { version: ROLE_DWELLER, kind: KIND_GENERAL }, status: FAIL, message: "update fail" });
            }
            return res_.send({ result: { version: version, kind: kind }, status: SUCCESS, message: "update success" });
        } else {
            const accountItem = new accounts({
                accessToken: accessToken,
                discordServerId: discordServerId,
                roleVersion: version,
                roleKind: kind,
                firstLoginDate: Date.now(),
                lastUpdateDate: Date.now(),
                lastLoginDate: Date.now(),
            })

            const saveItem = await accountItem.save();
            if (!saveItem) {
                console.log("save fail!", saveItem);
                return res_.send({ result: { version: ROLE_DWELLER, kind: KIND_GENERAL }, status: FAIL, message: "save fail" });
            }
            return res_.send({ result: { version: version, kind: kind }, status: SUCCESS, message: "save success" });
        }
    } catch (error) {
        console.log('something went wrong', error)
        return res_.send({ result: { version: ROLE_DWELLER, kind: KIND_GENERAL }, status: FAIL, message: "something went wrong" });
    }
}
