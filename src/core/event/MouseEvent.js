/*
 * @Author: Caven
 * @Date: 2019-12-31 16:58:31
 * @Last Modified by: Caven
 * @Last Modified time: 2020-04-22 12:35:16
 */

import Cesium from '@/namespace'
import Event from './Event'

/**
 * Mouse events in 3D scene, optimized Cesium event model
 */
class MouseEvent extends Event {
  constructor(viewer) {
    super()
    this._viewer = viewer
    this._setInputAction()
    this.on(DC.MouseEventType.CLICK, this._clickHandler, this)
    this.on(DC.MouseEventType.DB_CLICK, this._dbClickHandler, this)
    this.on(DC.MouseEventType.RIGHT_CLICK, this._rightClickHandler, this)
    this.on(DC.MouseEventType.MOUSE_MOVE, this._mouseMoveHandler, this)
  }

  /**
   *
   * Register Cesium mouse events
   *
   */
  _setInputAction() {
    let handler = new Cesium.ScreenSpaceEventHandler(this._viewer.canvas)
    Object.keys(Cesium.ScreenSpaceEventType).forEach(key => {
      let type = Cesium.ScreenSpaceEventType[key]
      this._cache[type] = new Cesium.Event()
      handler.setInputAction(movement => {
        this._cache[type].raiseEvent(movement)
      }, type)
    })
  }

  /**
   *
   * Gets the mouse information for the mouse event
   * @param {*} position
   *
   */
  _getMouseInfo(position) {
    let scene = this._viewer.scene
    let target = scene.pick(position)
    let cartesian = undefined
    if (scene.pickPositionSupported) {
      cartesian = scene.pickPosition(position)
    }
    let surfaceCartesian = undefined
    if (scene.mode === DC.SceneMode.SCENE3D) {
      let ray = scene.camera.getPickRay(position)
      surfaceCartesian = scene.globe.pick(ray, scene)
    } else {
      surfaceCartesian = scene.camera.pickEllipsoid(
        position,
        Cesium.Ellipsoid.WGS84
      )
    }
    return {
      target: target,
      windowPosition: position,
      position: cartesian,
      surfacePosition: surfaceCartesian
    }
  }

  /**
   *
   * Gets the target information for the mouse event
   * @param {*} target
   *
   */
  _getTargetInfo(target) {
    let overlay = undefined
    let layer = undefined
    let feature = undefined

    /**
     * Entity
     */
    if (target && target.id && target.id instanceof Cesium.Entity) {
      layer = target.id.layer
      if (layer && layer.getOverlay) {
        overlay = layer.getOverlay(target.id.overlayId)
      }
    }

    /**
     * Cesium3DTileFeature
     */
    if (target && target instanceof Cesium.Cesium3DTileFeature) {
      layer = target.tileset.layer
      feature = target
      if (layer && layer.getOverlay) {
        overlay = layer.getOverlay(target.tileset.overlayId)
        let propertyNames = feature.getPropertyNames()
        propertyNames.forEach(item => {
          overlay.attr[item] = feature.getProperty(item)
        })
      }
    }

    return { layer: layer, overlay: overlay, feature: feature }
  }

  /**
   *
   * @param {*} type
   * @param {*} mouseInfo
   *
   */
  _raiseEvent(type, mouseInfo = {}) {
    let event = undefined
    let targetInfo = this._getTargetInfo(mouseInfo.target)
    let overlay = targetInfo.overlay
    if (overlay && overlay.overlayEvent) {
      event = overlay.overlayEvent.getEvent(type)
    } else {
      event = this._viewer.viewerEvent.getEvent(type)
    }
    event &&
      event.numberOfListeners > 0 &&
      event.raiseEvent({
        ...targetInfo,
        ...mouseInfo
      })
  }

  /**
   *
   * Default click event handler
   * @param {*} movement
   *
   */
  _clickHandler(movement) {
    if (!movement || !movement.position) {
      return false
    }
    let mouseInfo = this._getMouseInfo(movement.position)
    this._raiseEvent(DC.MouseEventType.CLICK, mouseInfo)
  }

  /**
   *
   * Default dbClick event handler
   * @param {*} movement
   *
   */
  _dbClickHandler(movement) {
    if (!movement || !movement.position) {
      return false
    }
    let mouseInfo = this._getMouseInfo(movement.position)
    this._raiseEvent(DC.MouseEventType.DB_CLICK, mouseInfo)
  }

  /**
   *
   * Default rightclick event handler
   * @param {*} movement
   *
   */
  _rightClickHandler(movement) {
    if (!movement || !movement.position) {
      return false
    }
    let mouseInfo = this._getMouseInfo(movement.position)
    this._raiseEvent(DC.MouseEventType.RIGHT_CLICK, mouseInfo)
  }

  /**
   *
   * Default mousemove event handler
   * @param {*} movement
   *
   */
  _mouseMoveHandler(movement) {
    if (!movement || !movement.endPosition) {
      return false
    }
    let mouseInfo = this._getMouseInfo(movement.endPosition)
    this._viewer.canvas.style.cursor = mouseInfo.target ? 'pointer' : 'default'
    this._raiseEvent(DC.MouseEventType.MOUSE_MOVE, mouseInfo)
  }
}

export default MouseEvent
