const Peer = require("../Models/Peer")
const Common = require("./Common")
const crypto = require("crypto")
const Block = require("../Models/Block")
exports.add = async (block) => {
    console.log("peer adding", block)
    var peer = JSON.parse(block.data).peer
    await Peer.create(peer)
    console.log("created new peer")
    //hashing block
    block.blockHash = await Common.hashBlock(block)
    console.log(block.blockHash);
    block.prevBlockHash = await Common.getLastBlockHash()
    await Block.create(block)
    console.log("created new block")
    //add
}

exports.addCheck = async (block) => {
    console.log("peer contract received", block)
    //smart contract validation

    //send to aggregator
    block.peerSign = await Common.peerSign(block)
    await producer.send({
        topic: 'aggregateSignatures',
        messages: [{ value: JSON.stringify(block) }],
    })

    //add witness to DB
}