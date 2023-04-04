const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
    {
        id: { type: Number, default: 0 },
        inscription: { type: String, default: "" },
        inscriptionType: { type: Number, default: 0 }, // KIND_GENERAL
        actionDate: { type: Date, default: Date.now() },
    }
)

module.exports = collections = mongoose.model("collection", collectionSchema)
