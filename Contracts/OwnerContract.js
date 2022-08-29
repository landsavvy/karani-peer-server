const Common = require("./Common")
const Owner = require("../Models/Owner")
const Witness = require("../Models/Witness")
exports.addCheck = async (block) => {
    console.log("Owner contract received")
    //check block number    



    //smart contract validation
    var newOwner = JSON.parse(block.data).owner
    //check if owner exists
    var owner = await Owner.findOne({ idNum: newOwner.idNum })
    if (owner) {
        console.log("reject dup owner")
        await Common.sendRejection(block, "duplicate")
        return
    }

    //send to verify chain
    block.peerSign = await Common.peerSign(block)
    await producer.send({
        topic: 'aggregateSignatures',
        messages: [{ value: JSON.stringify(block) }],
    })

    //add Owner to DB
}
exports.add = async (block) => {
    console.log("Owner adding")
    var owner = JSON.parse(block.data).owner
    await Owner.create(owner)
    console.log("created new Owner")
    //hashing block
    await Common.createBlock(block)
    console.log("created new block")
}

exports.changeKeyCheck = async (block) => {
    //parse block
    var keyChange = JSON.parse(block.data).keyChange
    var parsedInfo = JSON.parse(keyChange.stringData)
    //get owner
    var owner = await Owner.findOne({ idNum: parsedInfo.ownerId })
    //get witness
    var witness = await Witness.findOne({ businessNum: owner.witnessNum })

    //confirm digital signature
    var validSignature = await Common.validateSignature(keyChange.stringData, keyChange.signature, witness.publicKey)
    if (!validSignature) {
        //reject
        Common.sendRejection(block, "owner-keyChange-invalid-signature")
        return
    }
    //send to verify chain
    block.peerSign = await Common.peerSign(block)
    await producer.send({
        topic: 'aggregateSignatures',
        messages: [{ value: JSON.stringify(block) }],
    })

}

exports.changeKey = async (block) => {
    console.log("OC: changing key")
    //parse data
    var keyChange = JSON.parse(block.data).keyChange
    var parsedInfo = JSON.parse(keyChange.stringData)
    //get owner
    var owner = await Owner.findOne({ idNum: parsedInfo.ownerId })
    var newKey = parsedInfo.newPublicKey
    //change key
    owner.publicKey = newKey
    await owner.save()

    //done
    console.log("OC: changed key")
    //hashing block
    await Common.createBlock(block)
    console.log("OC: created new block")
}

exports.changeWitnessCheck = async (block) => {
    //parse block
    var witnessChange = JSON.parse(block.data).witnessChange
    var parsedInfo = JSON.parse(witnessChange.stringData)
    //get owner
    var owner = await Owner.findOne({ idNum: parsedInfo.ownerId })

    //confirm digital signature
    var validSignature = await Common.validateSignature(witnessChange.stringData, witnessChange.signature, owner.publicKey)
    if (!validSignature) {
        //reject
        Common.sendRejection(block, "owner-witnessChange-invalid-signature")
        return
    }
    //send to verify chain
    block.peerSign = await Common.peerSign(block)
    await producer.send({
        topic: 'aggregateSignatures',
        messages: [{ value: JSON.stringify(block) }],
    })

}

exports.changeWitness = async (block) => {
    console.log("OC: changing witness")
    //parse data
    var witnessChange = JSON.parse(block.data).witnessChange
    var parsedInfo = JSON.parse(witnessChange.stringData)
    //get owner
    var owner = await Owner.findOne({ idNum: parsedInfo.ownerId })
    var newWitnessNum = parsedInfo.witnessNum
    console.log("OC: changing witness to", newWitnessNum)
    //change key
    owner.witnessNum = newWitnessNum
    await owner.save()
    //done
    console.log("OC: changed witness")
    //hashing block
    await Common.createBlock(block)
    console.log("OC: created new block")
}