const TitleSearch = require("../Models/TitleSearch");
exports.getLastNum = async (req, res) => {
    var lastNum = await TitleSearch.estimatedDocumentCount()
    console.log("TC: TitleSearch:Last num", lastNum)
    res.send({ lastNum })
}