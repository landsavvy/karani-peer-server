const mongoose = require("mongoose")
const { Schema } = mongoose

const SubdvisionSchema = new Schema(
    {
        parentTitleNum: String,
        subdivisions: [{ type: String, default: [] }],
        refNum: String,
    }, {
    timestamps: true
}
)
var Subdivision = mongoose.model("subdivision", SubdvisionSchema)

module.exports = Subdivision
