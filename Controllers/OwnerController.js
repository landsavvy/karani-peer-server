const Owner = require("../Models/Owner");

exports.getOwner = async (req, res) => {
    var owner = await Owner.findOne({ idNum: req.body.idNum })
    res.send({ owner })
}
exports.search = async (req, res) => {
    let errors = []
    var query = req.body.query
    //get submitted keys with ref
    let owner = await Owner.findOne({ idNum: query })
    if (!owner) {
        errors.push("owner-not-found")
        return res.send({ errors })
    }
    return res.send({ owner, errors })

}