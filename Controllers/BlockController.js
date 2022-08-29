const Block = require("../Models/Block")


exports.getBlock = async (req, res) => {
    let block = await Block.findOne({ blockNum: req.body.blockNum })
    res.send({ block })
}
exports.search = async (req, res) => {
    let errors = []
    var query = req.body.query
    //get submitted keys with ref
    let block = await Block.findOne({ blockNum: query })
    if (!block) {
        errors.push("block-not-found")
        return res.send({ errors })
    }
    block = JSON.parse(JSON.stringify(block))
    block.peerSignatures = block.peerSignatures.map(s => {
        delete s._id
        return s
    })
    return res.send({ block, errors })

}
exports.lastBlock = async (req, res) => {
    let errors = []
    var query = req.body.query
    //get submitted keys with ref
    let block = await Block.findOne().sort({ createdAt: -1 })
    if (!block) {
        errors.push("block-not-found")
        return res.send({ errors })
    }
    block = JSON.parse(JSON.stringify(block))
    block.peerSignatures = block.peerSignatures.map(s => {
        delete s._id
        return s
    })
    return res.send({ block, errors })

}