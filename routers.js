//contracts
const WitnessContract = require("./Contracts/WitnessContract")
const PeerContract = require("./Contracts/PeerContract")

const OwnerContract = require("./Contracts/OwnerContract")
const TitleContract = require("./Contracts/TitleContract")


exports.checkRouter = {
    witnessAdd: WitnessContract.addCheck,
    peerAdd: PeerContract.addCheck,
    //owners
    ownerAdd: OwnerContract.addCheck,
    ownerChangeKey: OwnerContract.changeKeyCheck,
    ownerChangeWitness: OwnerContract.changeWitnessCheck,
    //titles
    titleAdd: TitleContract.addCheck,
    titleSubdivision: TitleContract.subdivisionCheck,
    titleTransfer: TitleContract.transferCheck,
    titleSearch: TitleContract.searchCheck,

}

exports.blockRouter = {
    witnessAdd: WitnessContract.add,
    peerAdd: PeerContract.add,
    //owners
    ownerAdd: OwnerContract.add,
    ownerChangeKey: OwnerContract.changeKey,
    ownerChangeWitness: OwnerContract.changeWitness,
    //titles
    titleAdd: TitleContract.add,
    titleSubdivision: TitleContract.subdivision,
    titleTransfer: TitleContract.transfer,
    titleSearch: TitleContract.search,


}
