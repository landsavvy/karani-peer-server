const Common = require("./Common")
const Witness = require("../Models/Witness")
const Subdivision = require("../Models/Subdivision")
const Transfer = require("../Models/Transfer")
const Title = require("../Models/Title");
const TitleSearch = require("../Models/TitleSearch");
const Owner = require("../Models/Owner");
const turf = require("@turf/turf")
function getBoundingBox(title) {
    //most is inverted at begining
    var most = {
        west: 180,
        north: -90,
        south: 90,
        east: -180
    }
    title.coords.forEach(point => {
        //set north
        if (point.lat > most.north) {
            most.north = point.lat
        }
        //set south
        if (point.lat < most.south) {
            most.south = point.lat
        }
        //set east
        if (point.lng > most.east) {
            most.east = point.lng
        }
        //set west
        if (point.lat < most.west) {
            most.west = point.lng
        }

    });
    return most
}
function converCoordinates(coords) {
    var points = []
    coords.forEach(c => {
        points.push([c.lng, c.lat])
    })
    // console.log(points)
    return points
}
async function checkOverlaps(title) {
    let box = getBoundingBox(title)
    //find all titles in range
    var titles = await Title.find({ "most.north": { $gte: box.south }, "most.south": { $lte: box.north }, "most.east": { $gte: box.west }, "most.west": { $lte: box.east } })
    console.log("TC: possible overlap count", titles.length)
    var overlap = false
    for (let t of titles) {
        var currentPoly = turf.polygon([converCoordinates(title.coords)])
        var poly2 = turf.polygon([converCoordinates(t.coords)])
        // console.log(poly2)
        var o = turf.booleanOverlap(currentPoly, poly2)
        var s = turf.booleanEqual(currentPoly, poly2)
        if (o || s) {
            console.log("TC: overlap", o, s)
            overlap = true
            break
        }
    }


    //send rejection
    return overlap
}

async function checkWithin(smallCoords, bigCoords) {
    var small = turf.polygon([converCoordinates(smallCoords)])
    var big = turf.polygon([converCoordinates(bigCoords)])
    var within = turf.booleanWithin(small, big)
    return
}
async function checkAllWithin(polygons, parent) {
    var test = true
    var parent = turf.polygon([converCoordinates(parent.coords)])
    var parentScaled = turf.transformScale(parent, 1.01)
    for (let poly of polygons) {
        var sub = turf.polygon([converCoordinates(poly)])
        var within = turf.booleanWithin(sub, parentScaled)

        if (!within) {
            console.log("TC: not within")
            test = false
            break
        }
    }
    return test
}

exports.addCheck = async (block) => {
    console.log("TC: title contract received")

    //smart contract validation
    var title = JSON.parse(block.data).title
    var overlaps = await checkOverlaps(title)
    if (overlaps) {
        Common.sendRejection(block, "title overlap")
        return
    }
    //send to verify chain
    block.peerSign = await Common.peerSign(block)
    await producer.send({
        topic: 'aggregateSignatures',
        messages: [{ value: JSON.stringify(block) }],
    })

}
exports.add = async (block) => {
    console.log("TC: title adding")
    var title = JSON.parse(block.data).title
    title.most = getBoundingBox(title)
    title.blocks = [{
        blockNum: block.blockNum,
        txType: block.txType,
        txTime: block.txTime
    }]
    await Title.create(title)
    console.log("TC: created new title")
    //hashing block
    await Common.createBlock(block)
    console.log("TC: created new block")
}
exports.subdivisionCheck = async (block) => {
    console.log("TC: Subdivide Check")
    var titleSubdivision = JSON.parse(block.data).titleSubdivision
    var signatures = titleSubdivision.signatures
    let sig1 = signatures[0]
    var parentTitle = await Title.findOne({ titleNum: sig1.titleNum })


    //get parsed info
    var parsedInfo = JSON.parse(sig1.stringData)
    //validate signatures
    var signCount = 0
    for (let ownerId of parentTitle.ownerIds) {
        //get signature
        let sig = signatures.filter(s => s.ownerId == ownerId)[0]
        try {
            //get owner
            var owner = await Owner.findOne({ idNum: ownerId })
            //validate sig
            //confirm digital signature
            var validSignature = await Common.validateSignature(sig.stringData, sig.signature, owner.publicKey)
            if (validSignature) {
                signCount++
            }
        } catch (ex) {
            console.log(ex)
        }

    }
    if (signCount != parentTitle.ownerIds.length) {
        //reject
        Common.sendRejection(block, "title-subdivide-invalid-signature")
        return
    }

    //parse polygons
    var polygons = JSON.parse(parsedInfo.subCoords);
    //check parent title unsubdivided
    if (parentTitle.status != "ACTIVE") {
        //reject
        Common.sendRejection(block, "title-subdivide-parent-not-active")
        return
    }
    //check all polygons are within parent title
    var allWithin = await checkAllWithin(polygons, parentTitle)
    if (!allWithin) {
        Common.sendRejection(block, "title-subdivide-polygons-outside-parent")
        return
    }
    //send to verify chain
    block.peerSign = await Common.peerSign(block)
    await producer.send({
        topic: 'aggregateSignatures',
        messages: [{ value: JSON.stringify(block) }],
    })

}
exports.subdivision = async (block) => {
    console.log("TC: title subdviding")
    var titleSubdivision = JSON.parse(block.data).titleSubdivision
    //parse data
    var signatures = titleSubdivision.signatures
    let sig1 = signatures[0]
    //get parent title
    var parsedInfo = JSON.parse(sig1.stringData)
    var parentTitle = await Title.findOne({ titleNum: sig1.titleNum })
    //parse polygons
    var polygons = JSON.parse(parsedInfo.subCoords);
    var currentNum = (await Title.estimatedDocumentCount()) + 1
    //create titles    
    var titleNames = []
    for (poly of polygons) {
        var titleNum = parentTitle.county + "/" + currentNum
        let title = {
            ownerIds: parentTitle.ownerIds,
            titleNum,
            size: parentTitle.size / polygons.length,
            use: parentTitle.use,
            coords: poly,
            blocks: [{
                blockNum: block.blockNum,
                txType: block.txType,
                txTime: block.txTime
            }],
            county: parentTitle.county,
            parentTitle: parentTitle.titleNum,
            lastTransferDate: parentTitle.lastTransferDate
        }
        title.most = getBoundingBox(title)
        title = await Title.create(title)
        currentNum++
        titleNames.push(titleNum)
    }
    //create subdivision record
    var subdvision = await Subdivision.create({
        parentTitleNum: parentTitle.titleNum,
        subdivisions: titleNames,
        refNum: titleSubdivision.refNum
    })

    //change parent title to subdivided
    parentTitle.status = "SUBDIVIDED"
    parentTitle.blocks.push({
        blockNum: block.blockNum,
        txType: block.txType,
        txTime: block.txTime
    })
    await parentTitle.save()
    //dones
    console.log("TC: subdivde new title")
    //hashing block
    await Common.createBlock(block)
    console.log("TC: subdivde new block")
}

exports.searchCheck = async (block) => {
    console.log("TC: title contract received")
    //no checks performed for searches
    //send to verify chain
    block.peerSign = await Common.peerSign(block)
    await producer.send({
        topic: 'aggregateSignatures',
        messages: [{ value: JSON.stringify(block) }],
    })
}
exports.search = async (block) => {
    console.log("TC: title search")
    let searchDoc = JSON.parse(block.data).details.searchDoc
    //get owners names and addresses
    let title = await Title.findOne({ titleNum: searchDoc.titleNum })
    title.blocks.push({
        blockNum: block.blockNum,
        txType: block.txType,
        txTime: block.txTime
    })
    await title.save()

    await Common.createBlock(block)
    console.log("TC: created new block")
}
exports.transferCheck = async (block) => {
    console.log("TC: title contract received")
    var titleTransfer = JSON.parse(block.data).titleTransfer
    var signatures = titleTransfer.signatures
    var title = await Title.findOne({ titleNum: signatures[0].titleNum })
    //check parent title unsubdivided
    if (title.status != "ACTIVE") {
        //reject
        Common.sendRejection(block, "title-transfer-title-not-active")
        return
    }
    //validate owners ids
    var signCount = 0
    for (let ownerId of title.ownerIds) {
        //get signature
        let sig = signatures.filter(s => s.currentOwnerId == ownerId)[0]
        try {
            //get owner
            var currentOwner = await Owner.findOne({ idNum: ownerId })
            //validate sig
            //confirm digital signature
            var validSignature = await Common.validateSignature(sig.stringData, sig.signature, currentOwner.publicKey)
            if (validSignature) {
                signCount++
            }
        } catch (ex) {
            console.log(ex)
        }

    }
    if (signCount != title.ownerIds.length) {
        //reject
        Common.sendRejection(block, "title-transfer-invalid-signature")
        return
    }
    //send to verify chain
    block.peerSign = await Common.peerSign(block)
    await producer.send({
        topic: 'aggregateSignatures',
        messages: [{ value: JSON.stringify(block) }],
    })

}
exports.transfer = async (block) => {
    console.log("TC: title subdviding")
    var titleTransfer = JSON.parse(block.data).titleTransfer
    //get parse info from first array
    var sig = titleTransfer.signatures[0]
    //parse info
    var parsedInfo = JSON.parse(sig.stringData)
    var title = await Title.findOne({ titleNum: sig.titleNum })
    var previousOwners = title.ownerIds
    //change title owner
    title.ownerIds = parsedInfo.newOwnerIds.split(",")
    title.blocks.push({
        blockNum: block.blockNum,
        txType: block.txType,
        txTime: block.txTime

    })
    //change title transfer date
    title.lastTransferDate = new Date()
    await title.save()
    //create transfer

    let transfer = {
        titleNum: parsedInfo.titleNum,
        from: previousOwners,
        to: parsedInfo.newOwnerIds,
        refNum: titleTransfer.refNum
    }
    await Transfer.create(transfer)

    console.log("TC: transfered title")
    //hashing block
    await Common.createBlock(block)
    console.log("TC: transfered new block")
}
