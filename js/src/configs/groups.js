module.exports = {
  // MODBUS PLC //

  // ModbusD0: {
  //   defaultId: 'D0',
  //   defaultSubsets: {
  //     readings: {
  //       cond: { addr: 174, clsName: 'ModbusCond' }
  //     }
  //   }
  // },
  ModbusD1: {
    defaultId: 'D1',
    defaultSubsets: {
      readings: {
        cond: { addr: 150, clsName: 'ModbusCond' },
        // pH: { addr: 158, clsName: 'ModbusPh' },
        temp: { addr: 154, clsName: 'ModbusTemp' },
        flow: { addr: 252, clsName: 'ModbusFlow' },
        pump: { addr: 316, clsName: 'ModbusPump' }
      },
      controls: {
        start: { addr: 4, clsName: 'ModbusBool' },
        setPumpsFlow: { addr: 270, clsName: 'ModbusFlow' },
        setPumpsPerc: { addr: 56, clsName: 'ModbusPerc' },
        pumpsAuto: { addr: 34, clsName: 'ModbusBool' }
      }
    }
  },
  ModbusD2: {
    defaultId: 'D2',
    defaultSubsets: {
      readings: {
        cond: { addr: 174, clsName: 'ModbusCond' },
        pH: { addr: 182, clsName: 'ModbusPh' },
        temp: { addr: 178, clsName: 'ModbusTemp' },
        flow: { addr: 244, clsName: 'ModbusFlow' },
        pump: { addr: 332, clsName: 'ModbusPump' }
      },
      controls: {
        start: { addr: 3, clsName: 'ModbusBool' },
        setPumpsFlow: { addr: 238, clsName: 'ModbusFlow' },
        setPumpsPerc: { addr: 54, clsName: 'ModbusPerc' },
        pumpsAuto: { addr: 37, clsName: 'ModbusBool' },
      }
    }
  },
  ModbusC1: {
    defaultId: 'C1',
    defaultSubsets: {
      readings: {
        // cond: { addr: , clsName: 'ModbusCond' },
        // pH: { addr: 170, clsName: 'ModbusPh' },
        temp: { addr: 166, clsName: 'ModbusTemp' },
        flow: { addr: 260, clsName: 'ModbusFlow' },
        pump: { addr: 320, clsName: 'ModbusPump' }
      },
      controls: {
        start: { addr: 6, clsName: 'ModbusBool' },
        setPumpsFlow: { addr: 274, clsName: 'ModbusFlow' },
        setPumpsPerc: { addr: 58, clsName: 'ModbusPerc' },
        pumpsAuto: { addr: 35, clsName: 'ModbusBool' }
      }
    }
  },
  ModbusC2: {
    defaultId: 'C2',
    defaultSubsets: {
      readings: {
        cond: { addr: 186, clsName: 'ModbusCond' },
        pH: { addr: 194, clsName: 'ModbusPh' },
        temp: { addr: 190, clsName: 'ModbusTemp' },
        flow: { addr: 248, clsName: 'ModbusFlow' },
        pump: { addr: 334, clsName: 'ModbusPump' }
      },
      controls: {
        start: { addr: 10, clsName: 'ModbusBool' },
        setPumpsFlow: { addr: 240, clsName: 'ModbusFlow' },
        setPumpsPerc: { addr: 55, clsName: 'ModbusPerc' },
        pumpsAuto: { addr: 38, clsName: 'ModbusBool' }
      }
    }
  },
  ModbusC3: {
    defaultId: 'C3',
    defaultSubsets: {
      readings: {
        cond: { addr: 162, clsName: 'ModbusCond' }
      }
    }
  },
  ModbusE: {
    defaultId: 'E',
    defaultSubsets: {
      readings: {
        flow: { addr: 256, clsName: 'ModbusFlow' },
        pump: { addr: 318, clsName: 'ModbusPump' }
      },
      controls: {
        start: { addr: 5, clsName: 'ModbusBool' },
        setPumpsFlow: { addr: 272, clsName: 'ModbusFlow' },
        setPumpsPerc: { addr: 57, clsName: 'ModbusPerc' },
        pumpsAuto: { addr: 36, clsName: 'ModbusBool' }
      }
    }
  },
  ModbusED2: {
    defaultId: 'ED2',
    defaultSubsets: {
      readings: {
        voltageMeasure: { addr: 280, clsName: 'ModbusVolt' },
        voltageTotal: { addr: 264, clsName: 'ModbusVolt' },
        current: { addr: 268, clsName: 'ModbusCurrent' },
        positiveTimer: { addr: 32, clsName: 'ModbusTimer' },
        negativeTimer: { addr: 31, clsName: 'ModbusTimer' }
      },
      controls: {
        start: { addr: 1, clsName: 'ModbusBool' },
        positive: { addr: 2, clsName: 'ModbusBool' },
        reversal: { addr: 7, clsName: 'ModbusBool' },
        regVoltage: { addr: 22, clsName: 'ModbusBool' },
        voltageManSet: { addr: 282, clsName: 'ModbusVolt' },
        voltageRegSet: { addr: 300, clsName: 'ModbusVolt' },
        currentLimitSet: { addr: 288, clsName: 'ModbusCurrent' },
        reverseAuto: { addr: 30, clsName: 'ModbusTimer' }
      }
    }
  },
  ModbusPumps: {
    defaultId: 'pumps',
    defaultSubsets: {
      controls: {
        start: { addr: 0, clsName: 'ModbusBool' }
      }
    }
  },

  // ISKRA PH //

  IskraPhD0: {
    defaultId: 'D0',
    defaultSubsets: {
      readings: {
        pH: { clsName: 'IskraPh' },
        flow: { clsName: 'IskraFlow' }
      }
    }
  },
  IskraPhD1: {
    defaultId: 'D1',
    defaultSubsets: {
      readings: {
        pH: { clsName: 'IskraPh' }
      }
    }
  },
  IskraPhD2: {
    defaultId: 'D2',
    defaultSubsets: {
      readings: {
        pH: { clsName: 'IskraPh' }
      }
    }
  },
  IskraPhC1: {
    defaultId: 'C1',
    defaultSubsets: {
      readings: {
        pH: { clsName: 'IskraPh' }
      }
    }
  },
  IskraPhC2: {
    defaultId: 'C2',
    defaultSubsets: {
      readings: {
        pH: { clsName: 'IskraPh' }
      }
    }
  },
  IskraPhC3: {
    defaultId: 'C3',
    defaultSubsets: {
      readings: {
        pH: { clsName: 'IskraPh' },
        flow: { clsName: 'IskraFlow' }
      }
    }
  },

  // ISKRA MAIN //

  IskraMainD0: {
    defaultId: 'D0',
    defaultSubsets: {
      constrols: {
        pm: { clsName: 'IskraBool' }
      }
    }
  },
  IskraMainD1: {
    defaultId: 'D1',
    defaultSubsets: {
      // readings: {
      //   press: { clsName: 'IskraPres' }
      // },
      constrols: {
        reed: { clsName: 'IskraBool' },
        ev: { clsName: 'IskraBool' }
      }
    }
  },
  IskraMainD2: {
    defaultId: 'D2',
    defaultSubsets: {
      readings: {
        // press: { clsName: 'IskraPres' },
        cond: { clsName: 'IskraCond' }
      },
      constrols: {
        reed: { clsName: 'IskraBool' },
        ev: { clsName: 'IskraBool' }
      }
    }
  },
  IskraMainC1: {
    defaultId: 'C1',
    defaultSubsets: {
      readings: {
        // press: { clsName: 'IskraPres' },
        cond: { clsName: 'IskraCond' }
      },
      constrols: {
        reed: { clsName: 'IskraBool' },
        ev: { clsName: 'IskraBool' }
      }
    }
  },
  IskraMainC2: {
    defaultId: 'C2',
    defaultSubsets: {
      // readings: {
      //   press: { clsName: 'IskraPres' },
      //   cond: { clsName: 'IskraCond' }
      // },
      constrols: {
        reed: { clsName: 'IskraBool' },
        ev: { clsName: 'IskraBool' }
      }
    }
  },
  IskraMainC3: {
    defaultId: 'C3',
    defaultSubsets: {
      constrols: {
        pm: { clsName: 'IskraBool' }
      }
    }
  },
  IskraMainED1: {
    defaultId: 'ED1',
    defaultSubsets: {
      readings: {
        voltageMeasure: { clsName: 'IskraVolt' },
        current: { clsName: 'IskraCurrent' }
      },
      constrols: {
        reversal: { clsName: 'IskraBool' }
      }
    }
  }
}
