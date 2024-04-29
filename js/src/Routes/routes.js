const express = require("express")
const router = express.Router()
const urlencodedParser = express.urlencoded({extended: false})
const checkList = require("./../bin/helpers/checkList")
const readSerial = require("./../bin/helpers/readSerial")
//const Device = require("./../bin/src/Device")
//const ArduinoADS = require("./../bin/src/ArduinoADS")
//const ArduinoDAC = require("./../bin/src/ArduinoDAC")
//const arduinoDAC = new ArduinoDAC()

// setInterval(readSerial, 500)
// setInterval(checkList, 500)

// router.get("/ads", (req, res) => {
//     res.json(ArduinoADS.cash)
// })

// router.get("/list", (req, res) => {
//     res.json(Device.cash)
// })

// router.get("/dac", (req, res) => {
//     res.render("dac")
// })


// router.post("/dac", urlencodedParser, (req, res) => {
//     ArduinoDAC.cash = JSON.parse(JSON.stringify(req.body))
//     console.log(ArduinoDAC.cash)
//     res.sendStatus(200)
//     //arduinoDAC.SerialWrite(arduinoDAC.objInStr(str))
// })

module.exports = router