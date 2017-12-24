import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import ol from 'openlayers'

export default class viewAppInstance extends React.Component {

  serveMap() {
    var layers = [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),
      new ol.layer.Tile({
        extent: [-13884991, 2870341, -7455066, 6338219],
        source: new ol.source.TileWMS({
          url: 'https://ahocevar.com/geoserver/wms',
          params: { 'LAYERS': 'topp:states', 'TILED': true },
          serverType: 'geoserver',
          // Countries have transparency, so do not fade tiles:
          transition: 0
        })
      }),
      new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: 'http://cartoview.localhost/geoserver/wms',
          params: { 'LAYERS': 'geonode:animal_abuse_lacity', 'TILED': true },
          serverType: 'geoserver',
          transition: 10
        })
      }),
    ];

    this.map = new ol.Map({
      layers: layers,
      target: this.mapId,
      view: new ol.View({
        center: [0, 0],
        zoom: 2
      })
    });
  }

  componentDidMount() {
    this.serveMap()
  }

  render() {
    return (
      <div>
        <div
          ref={m => this.mapId = m}
          className="map"
          style={{ width: '100%', height: '400px' }}></div>
        <input
          id="swipe"
          type="range"
          style={{ width: '100%' }}
          ref={(input) => { this.rangeInput = input; }}
          onChange={(e) => { console.log(this.rangeInput.value) }} />
      </div>
    )
  }
}

global.viewAppInstance = viewAppInstance;
global.React = React;
global.ReactDOM = ReactDOM;