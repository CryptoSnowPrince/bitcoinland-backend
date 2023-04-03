const { accounts } = require('../db/accounts');
const { SUCCESS, FAIL, isAccount } = require('../../utils')

module.exports = async (req_, res_) => {
    console.log("getUserInfo: ", req_.body);
    const accessToken = req_.query.accessToken;
    const discordServerId = req_.query.discordServerId;

    if (!accessToken || !isAccount(accessToken)) {
        console.log("null: ", (!accessToken || !isAccount(accessToken)));
        return res_.send({ result: false, status: FAIL, message: "accessToken fail" });
    }

    const fetchItem = await accounts.findOne({ accessToken: accessToken });
    //console.log("fetchItem: ", fetchItem);
    if (fetchItem && isAccount(fetchItem.accessToken)) {
        // update last loginTime
        const _updateResult = await accounts.updateOne({ accessToken: accessToken }, {
            lastLoginDate: Date.now()
        });

        if (!_updateResult) {
            console.log("updateOne fail!", _updateResult);
        }
        return res_.send({ result: fetchItem, status: SUCCESS, message: "accessToken info" });
    } else {
        return res_.send({ result: false, status: FAIL, message: "NO_REGISTER" });
    }
}
