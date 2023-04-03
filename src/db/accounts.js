const mongoose = require("mongoose");
const { KIND_GENERAL, ROLE_DWELLER } = require("../utils");

const accountSchema = new mongoose.Schema(
    {
        accessToken: { type: String, default: "" },
        discordServerId: { type: String, default: "" },
        address: { type: String, default: "" },
        publicKey: { type: String, default: "" },
        roleVersion: { type: Number, default: ROLE_DWELLER },
        roleKind: { type: Number, default: KIND_GENERAL },
        firstLoginDate: { type: Date, default: Date.now() },
        lastUpdateDate: { type: Date, default: Date.now() },
        lastLoginDate: { type: Date, default: Date.now() },
    }
)

module.exports = accounts = mongoose.model("account", accountSchema)
