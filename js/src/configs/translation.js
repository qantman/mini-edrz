const Translation = require('@/classes/Translation')
const lang = require('@/configs/server').lang
module.exports = new Translation(lang)
