const Title = require("../Models/Title");

exports.exists = async (req, res) => {
    let titleNum = req.body.titleNum;
    let title = await Title.findOne({ titleNum })
    if (title) {
        return res.send({ exists: true })
    }
    return res.send({ exists: false })
}
exports.search = async (req, res) => {
    let errors = []
    var query = req.body.query
    //get submitted keys with ref
    let title = await Title.findOne({ titleNum: query })
    if (!title) {
        errors.push("title-not-found")
        return res.send({ errors })
    }
    return res.send({ title, errors })

}
exports.getLastNum = async (req, res) => {
    var lastNum = await Title.estimatedDocumentCount()
    console.log("TC: TitleContract:Last num", lastNum)
    res.send({ lastNum })
}
exports.getTitle = async (req, res) => {
    var title = await Title.findOne({ titleNum: req.body.titleNum })

    res.send({ title })
}