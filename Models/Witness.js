const mongoose = require("mongoose")
const { Schema } = mongoose

const WitnessSchema = new Schema(
    { name: String, businessNum: String, publicKey: String }, {
    timestamps: true
}
)
var Witness = mongoose.model("witness", WitnessSchema)

module.exports = Witness
