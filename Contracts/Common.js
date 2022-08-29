const crypto = require("crypto")
const Block = require("../Models/Block");
const { last } = require("lodash");
exports.createBlock = async (block) => {
    block.blockHash = await this.hashBlock(block)
    console.log("new hash", block.blockHash);
    block.prevBlockHash = await this.getLastBlockHash()
    await Block.create(block)
}

exports.sendRejection = async (block, comment = "") => {
    console.log("Common : reject", block.blockNum)
    var newBlock = JSON.parse(JSON.stringify(block))
    newBlock.confirmStatus = false
    newBlock.comment = comment
    await producer.send({
        topic: 'confirmStatus',
        messages: [{ value: JSON.stringify(newBlock) }],
    })
}
exports.checkValidBlockNum = async (block) => {
    var lastNum = await Block.estimatedDocumentCount()
    var validNum = lastNum < block.blockNum
    console.log(lastNum, block.blockNum)
    if (!validNum) {
        await this.sendRejection(block, "bad block number")
    }
    return validNum
}
exports.checkGokSign = async (block) => {
    var dummyBlock = JSON.parse(JSON.stringify(block))
    delete dummyBlock.gokSign
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(JSON.stringify(dummyBlock));
    verify.end();
    var gokValid = verify.verify(GOK_PUBLIC_KEY, block.gokSign, 'base64')
    if (!gokValid) {
        await this.sendRejection(block)
    }
    return gokValid
}

exports.validateSignature = async (string, signature, publicKey) => {

    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(string);
    verify.end();
    var validSignature = verify.verify(publicKey, signature, 'base64')
    return validSignature
}
exports.peerSign = async (block) => {
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(JSON.stringify(block));
    signer.end();
    const signature = signer.sign(PEER_PRIVATE_KEY, 'base64')
    console.log("Common:peer signed", block.blockNum)

    return {
        peerId: process.env.PEER_CLIENT_ID,
        peerSignature: signature
    }
}
exports.hashBlock = async (block) => {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(block));
    return hash.digest('hex')
}
exports.getLastBlockHash = async () => {
    var numDocs = await Block.estimatedDocumentCount()
    if (numDocs == 0) {
        //64 zeros
        return "0000000000000000000000000000000000000000000000000000000000000000"
    }
    var lastBlock = await Block.findOne({}).sort({ _id: -1 })
    var hash = lastBlock.blockHash
    console.log(hash)
    return hash
}

