/*
 * @Author: Caven
 * @Date: 2020-04-22 09:44:30
 * @Last Modified by: Caven
 * @Last Modified time: 2020-04-25 15:09:26
 */
;(function() {
  let isCesiumLoaded = false
  let DC = {
    Author: 'Caven Chen',
    GitHub: 'https://github.com/Digital-Visual',
    Version: '1.0.2',
    Config: {},
    Namespace: {},
    Initialized: false
  }
  delete window.DC
  window.DC = DC

  require('../log')

  /**
   * load Cesium
   */
  function requireCesium() {
    return new Promise((resolve, reject) => {
      let Cesium = require('cesium/Cesium')
      resolve(Cesium)
    })
  }

  /**
   *
   */
  DC.init = callback => {
    if (!isCesiumLoaded) {
      requireCesium().then(Cesium => {
        DC.Namespace['Cesium'] = Cesium
        delete window.Cesium
        isCesiumLoaded = true
        callback && callback()
      })
    } else {
      callback && callback()
    }
  }

  /**
   *
   */
  DC.use = plugin => {
    plugin && plugin.install && plugin.install(DC)
  }

  /**
   *
   */
  DC.ready = callback => {}
})()

export default DC
