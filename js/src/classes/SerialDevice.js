const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const Device = require("./Device")
class SerialDevice extends Device{

  _standatrPortLIN = {path: '/dev/ttyUSB0', baudRate: 9600 , dataBits: 8, parity: 'none', stopBits: 1, autoOpen: true}
  _standartPortWIN = {path: 'COM4', baudRate: 9600 , dataBits: 8, parity: 'none', stopBits: 1, autoOpen: true}
  isOpen = false
  clsName = "Serial Device"
  id = "SD"

  static _defaultSettings = {
    title: 'Serial Device',
    port: {path: '/dev/ttyUSB0', baudRate: 9600 , dataBits: 8, parity: 'none', stopBits: 1, autoOpen: true}, // стандартный порт на линуксе 
    unit: 1,
    regs: [],
    coils: [],
    errors: {},
    active: false,
  }

  static _clsConf (defaultGroups) {
    return {
      mapSettings: true,
      classes: this._classes,
      subsets: {
        groups: {
          mapGetters: true,
          hideAll: false,
          default: defaultGroups
        }
      },
      defaultSettings: SerialDevice._defaultSettings
    }
  }

  constructor(port, obj, clsConf){
    super(obj, clsConf)
    if(!port){
      this._port = this._standatrPortLIN
    }else{
      this._port = port
    }
    this._timeout = 200
    obj = obj || {}
    obj.clsName = obj.clsName || 'SerialDevice'
    obj.id = obj.id || 'serialDevice'
  }

  connect(){
    return new Promise((resolve, reject) => {
      let reconnect = setInterval(() => {
        SerialPort.list().then(list => {
          for(let i = 0; i < list.length; i++){
            if(list[i].path == this._port.path){
              this._serialport = new SerialPort(this._port)
              this._parser = this._serialport.pipe(new ReadlineParser({ delimiter: '\r\n' }))
              this.isOpen = true
              clearInterval(reconnect)
              resolve(this.isOpen)
              break
            }else {
              let err = {"Error" : "Device not found"}
              this._defaultSettings.errors.connection = err
              reject(err)
            }
          }
        })
      }, this._timeout)
    })
  }

  readAll(){
    return new Promise((res) => {
      try{
        this._parser.on("data", (data) => {
          this.data = data.split(";")
          return res(this.data)
        })
      }catch(e){
        throw new Error(e)
      }
    }, reject => {
      throw new Error(reject)
    })
  }

  writeValues(str){
    this._serialport.write(str)
  }

  setGroup (g, group) {
    // Takes an instance of Register class
    return this.addPromise(new Promise(async (resolve, reject) => {
      try {
        if (!g || !group || !this.groups[g]) {
          return resolve(false)
        }
        var change = false
        var changesStr = '' + g + '('

        for (let c in group.controls) {
          if (c in this.groups[g].controls) {
            this.groups[g].controls[c].transformedVal =
              group.controls[c]
            changesStr = changesStr + c + '=' +
              this.groups[g].controls[c].transformedVal + '; '
            change = true
          }
        }
        if (change) {
          return resolve(changesStr.slice(0, -2) + ')')
        } else {
          return resolve(false)
        }
      } catch (e) { return reject(e) }
    }))
  }

  startReadLoop(time){
    let ms = time || 200
    this._loop = setInterval(async() => {
      await this.readAll()
    }, ms)
  }

  stopReadLoop(){
    clearInterval(this._loop)
  }
  
}
// let dev = new SerialDevice
// console.log(dev)

// dev.connect().then(res => {
//   dev.startReadLoop()
//   setInterval(async() => {
//     let data = await dev.readAll()
//     //console.log(data)
//   }, 500)
// })

module.exports = SerialDevice

