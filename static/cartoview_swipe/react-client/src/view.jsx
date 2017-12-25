import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import ol from 'openlayers'

export default class viewAppInstance extends React.Component {

  serveMap() {
    var osm = new ol.layer.Tile({
      source: new ol.source.OSM()
    });
  
    var layerRight = new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: URLS.geoserver+'wms',
        params: {
          'LAYERS': layerRightName,
          'TILED': true
        },
        serverType: 'geoserver',
        transition: 0
      })
    })
  
    var layerLeft = new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: URLS.geoserver+'wms',
        params: {
          'LAYERS': layerLeftName,
          'TILED': true
        },
        serverType: 'geoserver',
        transition: 0
      })
    });
  
    this.map = new ol.Map({
      layers: [osm, layerLeft, layerRight, ],
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

  componentDidMount() {
    this.serveMap()
  }

  render() {
    return (
      <div>
        <div
          ref={m => this.mapId = m}
          id={'map'}
          className="map"
          style={{ width: '100%', height: '400px' }}></div>
        <div className="swipe-container">
        <input
          id="swipe"
          type="range"
          ref={(input) => { this.rangeInput = input; }}
          />
        </div>
      </div>
    )
  }
}

global.viewAppInstance = viewAppInstance;
global.React = React;
global.ReactDOM = ReactDOM;