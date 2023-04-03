const mongoose = require("mongoose");

const accountsSchema = new mongoose.Schema(
    {
        accessToken: { type: String, default: "" },
        discordServerId: { type: String, default: "" },
        address: { type: String, default: "" },
        signature: { type: Number, default: "" },
        publicKey: { type: String, default: "" },
        firstLoginDate: { type: Date, default: Date.now() },
        lastUpdateDate: { type: Date, default: Date.now() },
        lastLoginDate: { type: Date, default: Date.now() },
    }
)

module.exports = accounts = mongoose.model("accounts", accountsSchema)
