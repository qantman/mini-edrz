module.exports = function dateFilter (value, format = 'time') {
  if (format.includes('reverse')) {
    var dt = new Date(value)
    var res = '' + dt.getFullYear() + '-' +
      ('0' + (dt.getMonth() + 1)).slice(-2) + '-' +
      ('0' + dt.getDate()).slice(-2) + '-' +
      ('0' + dt.getHours()).slice(-2) + '-' +
      ('0' + dt.getMinutes()).slice(-2) + '-' +
      ('0' + dt.getSeconds()).slice(-2)
    return res
  }

  const options = {}
  options.timeZone = 'Europe/Moscow'
  options.hour12 = false

  if (format.includes('date')) {
    options.day = '2-digit'
    options.month = '2-digit'
    options.year = 'numeric'
  }
  if (format.includes('time')) {
    options.hour = '2-digit'
    options.minute = '2-digit'
    options.second = '2-digit'
  }
  return new Intl.DateTimeFormat('ru-RU', options).format(new Date(value))
}
