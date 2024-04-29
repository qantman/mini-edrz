module.exports = {
  wordsToFloat: function (regs) {
    var buffer = new ArrayBuffer(32)
    var dv = new DataView(buffer, 0)

    dv.setInt16(0, regs[1])
    dv.setInt16(16, regs[0])

    return dv.getFloat32(0)
  },

  floatToWords: function (f) {
    var buffer = new ArrayBuffer(32)
    var dv = new DataView(buffer, 0)
    var res = []

    dv.setFloat32(0, f)

    res.push(dv.getInt16(16))
    res.push(dv.getInt16(0))

    return res
  }
}
