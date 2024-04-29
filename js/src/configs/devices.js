const Devices = require('@/classes/Devices')

// for default registers configuration see
// '@/classes/Devices'
// '@/classes/RegistersGroups'
// '@/configs/groups'

module.exports = {
  EDRZ_PLC: new Devices.ModbusPLC(null, {
    // D0: { clsName: 'ModbusD0' },
    // D1: { clsName: 'ModbusD1' },
    D2: { clsName: 'ModbusD2' },
    // C1: { clsName: 'ModbusC1' },
    C2: { clsName: 'ModbusC2' },
    // C3: { clsName: 'ModbusC3' },
    E: { clsName: 'ModbusE' },
    ED2: { clsName: 'ModbusED2' },
    pumps: { clsName: 'ModbusPumps' }
  })//,
  // iskraMain: new Devices.IskraMain(null, {
  //   D0: { clsName: 'IskraMainD0' },
  //   D1: { clsName: 'IskraMainD1' },
  //   D2: { clsName: 'IskraMainD2' },
  //   C1: { clsName: 'IskraMainC1' },
  //   C2: { clsName: 'IskraMainC2' },
  //   C3: { clsName: 'IskraMainC3' },
  //   ED1: { clsName: 'IskraMainED1' }
  // }),
  // iskraPh: new Devices.IskraPh(null, {
  //   D0: { clsName: 'IskraPhD0' },
  //   D1: { clsName: 'IskraPhD1' },
  //   D2: { clsName: 'IskraPhD2' },
  //   C1: { clsName: 'IskraPhC1' },
  //   C2: { clsName: 'IskraPhC2' },
  //   C3: { clsName: 'IskraPhC3' }
  // })
}
