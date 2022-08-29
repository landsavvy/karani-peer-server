const mongoose = require("mongoose")
const { Schema } = mongoose

const TransferSchema = new Schema(
    {
        titleNum: String,
        refNum: String,
        from: [String],
        to: [String],
        boardApproval: { type: Boolean, default: false },
        registrarApproval: { type: Boolean, default: false },

    }, {
    timestamps: true
}
)
var Transfer = mongoose.model("transfer", TransferSchema)

module.exports = Transfer
