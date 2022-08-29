const mongoose = require("mongoose")
const { Schema } = mongoose

const BlockSchema = new Schema(
    {
        blockNum: Number,
        txType: String,
        txTime: Number,
        data: String,
        gokSign: String,
        peerSignatures: [{ peerId: String, peerSignature: String }],
        blockHash: String,
        prevBlockHash: String
    },
    {
        timestamps: true
    })
var Block = mongoose.model("block", BlockSchema)

module.exports = Block
