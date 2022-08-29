const mongoose = require("mongoose")
const { Schema } = mongoose

const TitleSearchSchema = new Schema(
    {
        requestedBy: String,
        idNum: String,
        searchNum: Number,
        date: Date,
        titleNum: String,
        details: String,
    }, {
    timestamps: true
}
)
var TitleSearch = mongoose.model("titleSearch", TitleSearchSchema)
module.exports = TitleSearch
