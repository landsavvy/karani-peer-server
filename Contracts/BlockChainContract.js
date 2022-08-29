const Block = require("../Models/Block")
const Peer = require("../Models/Peer")
const crypto = require("crypto")
const _ = require("lodash")
//block routing
const { blockRouter } = require("../routers")


exports.addBlock = async (block) => {
    //check for signatures
    //get random indexes
    var signatures = _.sampleSize(block.peerSignatures, 1);
    console.log("BlockChainContract:confirming signatures")
    var valid = true
    const verify = crypto.createVerify('RSA-SHA256');
    if (block.txType != "peerAdd") {
        for (s of signatures) {
            let peer = await Peer.findOne({ peerId: s.peerId })

            var dummyBlock = JSON.parse(JSON.stringify(block))

            delete dummyBlock.peerSignatures
            console.log("BlockChainContract:peer verify", dummyBlock.blockNum)
            verify.update(JSON.stringify(dummyBlock));
            verify.end();
            //verify signatures
            valid = verify.verify(peer.publicKey, s.peerSignature, 'base64')
            console.log("BlockChainContract:peer verification checks", valid);
            if (!valid) {
                return
            }
        }
    } else {
        console.log("Peer Add:skipping peerSignature Verification")
    }



    //finally add data to blockchain
    blockRouter[block.txType](block)
    //process db
}
exports.getLast = async (req, res) => {
    var lastNum = await Block.estimatedDocumentCount()
    console.log("BlockChainContract:Last num", lastNum)
    res.send({ lastNum })
}