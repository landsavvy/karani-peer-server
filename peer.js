
require("dotenv").config()

//SRART EXPRESS SERVER
require("./peerServer").setupExpress()
const Common = require("./Contracts/Common")
const { Kafka } = require('kafkajs')

const fs = require('fs');

//key imports
global.GOK_PUBLIC_KEY = fs.readFileSync('./Keys/gokPublic.pem');
global.PEER_PRIVATE_KEY = fs.readFileSync('./Keys/peerPrivate.pem');
global.PEER_PUBLIC_KEY = fs.readFileSync('./Keys/peerPublic.pem');

console.log("process.env.KAFKA_SERVER", process.env.KAFKA_SERVER)
const kafka = new Kafka({
    clientId: process.env.PEER_CLIENT_ID,
    brokers: [process.env.KAFKA_SERVER]
})
const BlockChainContract = require("./Contracts/BlockChainContract")
const { checkRouter } = require("./routers")


async function initComms() {
    const consumer = kafka.consumer({ groupId: process.env.PEER_CLIENT_ID })
    global.producer = kafka.producer()
    await producer.connect()
    await consumer.connect()
    await consumer.subscribe({ topic: 'verifyBlock', fromBeginning: true })
    await consumer.subscribe({ topic: 'addBlock', fromBeginning: true })

    console.log("Started Peer Consumer")
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            try {
                var block = JSON.parse(message.value)
                if (topic == "verifyBlock") {
                    //output block
                    console.log("peer: verifyblock", block.blockNum, block.txType)
                    //checking for blocks only form gok node
                    var gokValid = await Common.checkGokSign(block)
                    var blockNumValid = await Common.checkValidBlockNum(block)
                    console.log("peer GOK verification", gokValid);
                    if (!gokValid || !blockNumValid) {
                        return
                    }
                    //pass block to router
                    checkRouter[block.txType](block)
                }
                if (topic == "addBlock") {
                    console.log("addblock", block.blockNo, topic)
                    //pass block to router
                    BlockChainContract["addBlock"](block)
                }

            } catch (ex) {
                console.error(ex)
            }


        },
    })

}
initComms()