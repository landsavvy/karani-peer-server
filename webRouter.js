var express = require("express")
var router = express.Router()
const BlockChainContract = require("./Contracts/BlockChainContract")

const TitleController = require("./Controllers/TitleController")
const SearchController = require("./Controllers/SearchController")
const BlockController = require("./Controllers/BlockController")
const PeerController = require("./Controllers/PeerController")
const OwnerController = require("./Controllers/OwnerController")
const WitnessController = require("./Controllers/WitnessController")

router.get("/api/v1/block/getLast", BlockChainContract.getLast)
//block routes

router.post("/api/v1/block/getBlock", BlockController.getBlock)
router.post("/api/v1/block/search", BlockController.search)
router.post("/api/v1/block/lastBlock", BlockController.lastBlock)
//peer routers
router.post("/api/v1/peer/getAll", PeerController.getAll)
//owner routers
router.post("/api/v1/owner/getOwner", OwnerController.getOwner)
router.post("/api/v1/owner/search", OwnerController.search)
//witness routes
router.post("/api/v1/witness/search", WitnessController.search)
//title routes
router.get("/api/v1/title/getLastNum", TitleController.getLastNum)
router.post("/api/v1/title/exists", TitleController.exists)
router.post("/api/v1/title/search", TitleController.search)
router.post("/api/v1/title/getTitle", TitleController.getTitle)
router.get("/api/v1/search/getLastNum", SearchController.getLastNum)

router.get("/", (req, res) => res.send("403: Unauthorised"))

module.exports = router
