const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        accessToken: { type: String, default: "" },
        discordServerId: { type: String, default: "" },
        address: { type: String, default: "" },
        publicKey: { type: String, default: "" },
        roleVersion: { type: Number, default: 0 }, // ROLE_DWELLER
        roleKind: { type: Number, default: 0 }, // KIND_GENERAL
        firstLoginDate: { type: Date, default: Date.now() },
        lastUpdateDate: { type: Date, default: Date.now() },
        lastLoginDate: { type: Date, default: Date.now() },
    }
)

module.exports = accounts = mongoose.model("account", accountSchema)
