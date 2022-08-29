const Witness = require("../Models/Witness")
exports.search = async (req, res) => {
    let errors = []
    var query = req.body.query
    //get submitted keys with ref
    let witness = await Witness.findOne({ businessNum: query })
    if (!witness) {
        errors.push("witness-not-found")
        return res.send({ errors })
    }
    return res.send({ witness, errors })

}