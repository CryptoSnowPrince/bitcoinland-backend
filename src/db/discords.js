const mongoose = require("mongoose");

const discordSchema = new mongoose.Schema(
    {
        discordServerId: { type: String, default: "" },
        collectionId: { type: Number, default: 0 },
        actionDate: { type: Date, default: Date.now() },
    }
)

module.exports = discords = mongoose.model("discord", discordSchema)
