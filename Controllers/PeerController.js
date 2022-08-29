const Peer = require("../Models/Peer")


exports.getAll = async (req, res) => {
    let peers = await Peer.find({})
    res.send({ peers })
}

