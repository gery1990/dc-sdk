/*
 * @Author: Caven
 * @Date: 2020-01-15 20:23:42
 * @Last Modified by: Caven
 * @Last Modified time: 2020-02-29 18:17:15
 */
import Cesium from '@/namespace'
import Effect from './Effect'

let RainShader = require('../shader/RainShader.glsl')

DC.RainEffect = class extends Effect {
  constructor(id) {
    super(id)
    this._state = DC.EffectState.INITIALIZED
    this.type = DC.EffectType.RAIN
  }

  /**
   * 准备代理
   */
  _prepareDelegate() {
    this._delegate = new Cesium.PostProcessStage({
      name: this._id,
      fragmentShader: RainShader
    })
  }
}

DC.EffectType.RAIN = 'rain'
