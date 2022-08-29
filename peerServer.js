
const express = require("express")
const mongoose = require("mongoose")

exports.setupExpress = async () => {
    var connectionString = "mongodb://root:root@localhost/peer1?authSource=admin"

    if (process.env.DOCKER_MODE) {
        console.log("running DOCKER MODE", process.env.DOCKER_MODE)
        connectionString = process.env.DOCKER_MONGO_CONNECT_STRING
    }
    await mongoose.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    console.log("MongoDB:connected")
    const port = process.env.SERVER_PORT
    const app = express()
    const cors = require("cors")
    const allowedOrigins = [
        'http://localhost',
        'http://localhost:8080',


    ];
    const corsOptions = {
        origin: (origin, callback) => {
            if (allowedOrigins.includes(origin) || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Origin not allowed by CORS'));
            }
        },
        credentials: true
    }
    app.use(cors(corsOptions))
    const server = require("http").createServer(app)
    const router = require("./webRouter")
    const bodyParser = require("body-parser")
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(router)
    server.listen(port, () => {
        console.log(`Server started on http://localhost:${port}`)
    })

}
