const Common = require("./Common")
const Witness = require("../Models/Witness")
const { json } = require("express")
exports.addCheck = async (block) => {
    console.log("witness contract received")


    //smart contract validation
    //rejection
    // await producer.send({
    //     topic: 'confirmStatus',
    //     messages: [{ value: JSON.stringify(block) }],
    // })


    //send to verify chain
    block.peerSign = await Common.peerSign(block)
    await producer.send({
        topic: 'aggregateSignatures',
        messages: [{ value: JSON.stringify(block) }],
    })

    //add witness to DB
}
exports.add = async (block) => {
    console.log("witness adding")
    var witness = JSON.parse(block.data).witness
    await Witness.create(witness)
    console.log("created new witness")
    //hashing block
    await Common.createBlock(block)
    console.log("created new block")
}