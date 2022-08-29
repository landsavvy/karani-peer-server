const mongoose = require("mongoose")
const { Schema } = mongoose

const OwnerSchema = new Schema(
    { name: String, idNum: String, witnessNum: String, address: String, publicKey: String }, {
    timestamps: true
}
)
var Owner = mongoose.model("owner", OwnerSchema)

module.exports = Owner
