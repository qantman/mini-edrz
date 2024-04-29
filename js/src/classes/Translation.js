const serverLang = require('@/configs/server').lang
const serverTrans = require('@/configs/translations')

module.exports = class Translation {
  static lang = serverLang

  static allTranslations = serverTrans

  static getTranslation = function (lang) {
    lang = lang || Translation.lang
    let all = Translation.allTranslations
    let res = {}
    for (let t in all) {
      res[t] = all[t][lang] || '(no translation)'
    }
    return res
  }

  constructor (obj, lang) {
    if (typeof obj === 'string' || obj instanceof String) {
      lang = lang || obj
      obj = {}
    }
    obj = obj || {}
    obj.lang = lang || obj.lang || Translation.lang

    Object.assign(this, obj)
    Object.assign(this,
      Translation.getTranslation(obj.lang))
  }
}
