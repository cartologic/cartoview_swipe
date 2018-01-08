import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './css/style.css'

import LayersHelper from './components/helpers/LayersHelper.jsx'
import FeaturesHelper from './components/helpers/FeaturesHelper.jsx'
import BasicViewerHelper from './components/helpers/BasicViewerHelper.jsx'
import Animation from './components/helpers/AnimationHelper.jsx'

import { default as LeftDrawer } from './components/Drawer/DrawerWithButton.jsx'
import CartoviewSnackBar from './components/CartoviewSnakeBar.jsx'
import CartoviewPopup from './components/PopUp.jsx'

import ol from 'openlayers'

import FileSaver from 'file-saver'

export default class viewAppInstance extends React.Component {
  state = {
    leftDrawerOpen: app_instance_config.drawerOptions.defaultDrawerOpen,
    drawerOptions: app_instance_config.drawerOptions,
    baseMapOptions: undefined,

    featureCollection: new ol.Collection(),
    featureIdentifyResult: [],
    featureIdentifyLoading: false,
    showPopup: false,
    activeFeature: 0,
    mouseCoordinates: [ 0, 0 ],
  }

  serveMap() {
    var backgroundBaseMaps = new ol.layer.Group({
      layers: this.basemapsLayers,
      name: 'background'
    })

    var layerRight = new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: URLS.geoserver + 'wms',
        params: {
          'LAYERS': layerRightName,
          'TILED': true
        },
        serverType: 'geoserver',
        transition: 0,
        tileLoadFunction:function(imageTile, src) {
          imageTile.getImage().src = `${URLS.proxy !== null ? URLS.proxy : ''}`+encodeURIComponent(src).replace(/%20/g, '+');
        }
      })
    })
    layerRight.set('name', 'layerRight')
    layerRight.set('title', layerRightTitle)

    var layerLeft = new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: URLS.geoserver + 'wms',
        params: {
          'LAYERS': layerLeftName,
          'TILED': true
        },
        serverType: 'geoserver',
        transition: 0,
        tileLoadFunction:function(imageTile, src) {
          imageTile.getImage().src = `${URLS.proxy !== null ? URLS.proxy : ''}`+encodeURIComponent(src).replace(/%20/g, '+');
        }
      })
    })
    layerLeft.set('name', 'layerLeft')
    layerLeft.set('title', layerLeftTitle)    
  
    this.map = new ol.Map({
      layers: [backgroundBaseMaps, layerLeft, layerRight,],
      target: this.mapId,
      controls: ol.control.defaults({
        attributionOptions: {
          collapsible: false
        }
      }),
      view: new ol.View({
        center: [0, 0],
        zoom: 2
      })
    });
  
    this.map.getView().fit(theExtent)
  
    var swipe = this.rangeInput
  
    layerRight.on('precompose', function (event) {
      var ctx = event.context;
      var width = ctx.canvas.width * (swipe.value / 100);
  
      ctx.save();
      ctx.beginPath();
      ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
      ctx.clip();
    });
  
    layerRight.on('postcompose', function (event) {
      var ctx = event.context;
      ctx.restore();
    });
    
    const _map = this.map
    swipe.addEventListener('input', function () {
      _map.render();
    }, false);
  }

  setLayerOpacity(layer, opacity) {
    this.map.getLayers().getArray().filter(l => {
      if (l.get('name') === layer) {
        l.setOpacity(opacity)
      }
    })
  }

  getBaseMaps() {
    let options = []
    this.basemapsLayers = []
    // where basemaps is defined in the html template
    // TODO: Pass basemaps using props
    basemaps.filter((b, i) => {
      if (b.name === 'background') {
        options.push('No Background')
        this.basemapsLayers.push(new ol.layer.Tile({}))
      }

      // if (b.name === 'AerialWithLabels') {
      //   options.push('Bing')
      //   this.basemapsLayers.push(
      //     new ol.layer.Tile({
      //       source: new ol.source.BingMaps({
      //         key: 'AnOGiCu2mPu9KfPl3rzvWLpRovXmBsnHEdEli8NR1NE99Av5BGNo2PfsXsJbsjum'
      //       }),
      //       visible: false
      //     })
      //   )
      // }

      if (b.type === 'OpenLayers.Layer.OSM') {
        options.push('OSMBaseMap')
        this.basemapsLayers.push(new ol.layer.Tile({
          source: new ol.source['OSM'](),
          name: 'OSMBaseMap',
          visible: true
        }))
      }

      // OpenLayers.Layer.XYZ
      if (b.type === 'OpenLayers.Layer.XYZ') {
        options.push(b.args[0])
        this.basemapsLayers.push(new ol.layer.Tile({
          source: new ol.source.XYZ({
            url: String(b.args[1]).replace("${z}/${x}/${y}", "{z}/{x}/{y}")
          }),
          name: b.args[0],
          visible: false
        }))
      }
    })

    this.setState({
      baseMapOptions: options
    })
  }

  resetFeatureCollection = () => {
    let {
      featureCollection
    } = this.state
    featureCollection.clear()
  }

  addStyleToFeature = (features) => {
    let {
      featureCollection
    } = this.state
    this.resetFeatureCollection()
    if (features && features.length > 0) {
      featureCollection.extend(features)
    }
  }

  zoomToFeature = (feature) => {
    let map = this.map
    this.addStyleToFeature([feature])
    const featureCenter = feature.getGeometry().getExtent()
    const center = BasicViewerHelper.getCenterOfExtent(featureCenter)
    Animation.flyTo(center, map.getView(), 14, () => {})
  }

  addOverlay = (node) => {
    const {
      activeFeature,
      featureIdentifyResult,
      mouseCoordinates
    } = this.state

    let position = mouseCoordinates

    if (featureIdentifyResult.length > 0) {
      const currentFeature = featureIdentifyResult[activeFeature]
      const featureExtent = currentFeature.getGeometry().getExtent()
      position = BasicViewerHelper.getCenterOfExtent(featureExtent)
    }

    this.overlay.setElement(node)
    this.overlay.setPosition(position)
  }

  featureIdentify = (map, coordinate) => {
    const view = map.getView()
    let identifyPromises = LayersHelper.getLayers(map.getLayers().getArray())
      .map(
        (layer) => FeaturesHelper.readFeaturesThenTransform(
        this.urls, layer, coordinate, view, map))
    Promise.all(identifyPromises).then(result => {
      const featureIdentifyResult = result.reduce((array1,
        array2) => array1.concat(array2), [])
      this.setState({
        featureIdentifyLoading: false,
        featureIdentifyResult,
        activeFeature: 0,
        showPopup: true
      }, () => this.addStyleToFeature(
        featureIdentifyResult))
    })
  }

  singleClickListner = () => {
    let map = this.map
    map.on('singleclick', (e) => {
      if (this.overlay) {
        this.overlay.setElement(undefined)
      }
      this.setState({
        mouseCoordinates: e.coordinate,
        featureIdentifyLoading: true,
        activeFeature: 0,
        featureIdentifyResult: [],
        showPopup: false
      })
      this.featureIdentify(map, e.coordinate)
    })
  }

  changeShowPopup = () => {
    const {
      showPopup
    } = this.state
    this.setState({
      showPopup: !showPopup
    })
  }

  addStyleToCurrentFeature = () => {
    const {
      activeFeature,
      featureIdentifyResult
    } = this.state
    this.addStyleToFeature([featureIdentifyResult[activeFeature]])
  }

  nextFeature = () => {
    const {
      activeFeature
    } = this.state
    const nextIndex = activeFeature + 1
    this.setState({
      activeFeature: nextIndex
    }, this.addStyleToCurrentFeature)
  }

  previousFeature = () => {
    const {
      activeFeature
    } = this.state
    const previuosIndex = activeFeature - 1
    this.setState({
      activeFeature: previuosIndex
    }, this.addStyleToCurrentFeature)
  }

  componentDidMount() {
    this.getBaseMaps()
    this.serveMap()

    if (app_instance_config.mapOptions.enableIdentify) {
      this.singleClickListner()
    }

    this.overlay = new ol.Overlay({
      autoPan: true,
    })
    this.map.addOverlay(this.overlay)
  }

  exportMap(map) {
    console.log(map)
    map.once('postcompose', (event) => {
      let canvas = event.context.canvas
      console.log(canvas)      
      if (navigator.msSaveBlob) {
        navigator.msSaveBlob(canvas.msToBlob(), 'map.png')
      } else {
        canvas.toBlob((blob) => {
          FileSaver.saveAs(blob, 'map.png')
        })
      }
    })
    map.renderSync()
  }

  setBaseMap(currentBaseMap, previousBaseMap) {
    if (currentBaseMap === 'No Background') {
      this.map.getLayers().getArray()[0].getLayers().getArray().map((b,i) => {
        b.get('name') === previousBaseMap &&
          this.map.getLayers().getArray()[0].getLayers().getArray()[i].setVisible(false)
      })
      return false
    }

    // setVisible of previousBaseMap = false
    this.map.getLayers().getArray()[0].getLayers().getArray().map((b,i) => {
      b.get('name') === previousBaseMap && 
        this.map.getLayers().getArray()[0].getLayers().getArray()[i].setVisible(false)  
    })

    // setVisible of currentBaseMap = true
    this.map.getLayers().getArray()[0].getLayers().getArray().map((b,i) => {
      b.get('name') === currentBaseMap &&
        this.map.getLayers().getArray()[0].getLayers().getArray()[i].setVisible(true)    
    })
  }

  render() {
    const childrenProps = {
      resetFeatureCollection: this.resetFeatureCollection,
      zoomToFeature: this.zoomToFeature,
      addOverlay: this.addOverlay,
      changeShowPopup: this.changeShowPopup,
      addStyleToFeature: this.addStyleToFeature,
      nextFeature: this.nextFeature,
      previousFeature: this.previousFeature,

      ...this.state,

      map: this.map
    }
    return (
      <div>
        <div
          ref={m => this.mapId = m}
          id={'map'}
          className="map"></div>
        <div className="swipe-container">
        <input
          id="swipe"
          type="range"
          ref={(input) => { this.rangeInput = input; }}
          />
        </div>
        
        {
          this.map && 
          <CartoviewPopup {...childrenProps} />
        }

        <CartoviewSnackBar open={childrenProps.featureIdentifyLoading} message={"Searching For Features at this Point"} />
        
        <LeftDrawer
          config = {{formTitle: app_instance_title, formAbstract:app_instance_abstract}}
          drawerOpen={this.state.leftDrawerOpen}
          drawerOptions= {this.state.drawerOptions}
          handleDrawerOpen={()=>{this.setState({leftDrawerOpen: true})}}
          handleDrawerClose={() => { this.setState({ leftDrawerOpen: false }) }}
          setLayerOpacity={(layer, opacity)=>{this.setLayerOpacity(layer, opacity)}}
          baseMapOptions={this.state.baseMapOptions && this.state.baseMapOptions}
          setBaseMap = {(currentBaseMap, previousBaseMap)=>{this.setBaseMap(currentBaseMap, previousBaseMap)}}
          exportMap = {()=>{this.exportMap(this.map)}}
        />
      </div>
    )
  }
}

global.viewAppInstance = viewAppInstance;
global.React = React;
global.ReactDOM = ReactDOM;