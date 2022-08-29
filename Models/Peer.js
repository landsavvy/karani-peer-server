const mongoose = require("mongoose")
const { Schema } = mongoose

const PeerSchema = new Schema({
    name: String, businessNum: String, peerId: String, publicKey: String
},
    {
        timestamps: true
    }
)
var Peer = mongoose.model("peer", PeerSchema)

module.exports = Peer
