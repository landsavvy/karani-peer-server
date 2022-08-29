const mongoose = require("mongoose")
const { Schema } = mongoose

const TitleSchema = new Schema(
    {
        ownerIds: [{ type: String }],
        titleNum: String,
        most: {
            west: Number,
            north: Number,
            east: Number,
            south: Number
        },
        lastTransferDate: Date,
        parentTitle: { type: String, default: "0" },
        coords: [{ lng: Number, lat: Number }],
        charges: { type: String, default: "NULL" },
        size: { type: Number, default: 0 },
        use: { type: String, default: "agriculture" },
        status: { type: String, default: "ACTIVE" },
        county: String,
        blocks: [{ blockNum: Number, txType: String, txTime: Number }]
    }, {
    timestamps: true
}
)
var Title = mongoose.model("title", TitleSchema)

module.exports = Title
