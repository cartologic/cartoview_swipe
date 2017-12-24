import React from 'react';
import PropTypes from 'prop-types';

import ol from 'openlayers'

export default class MapExtent extends React.Component {

  serveMap() {
    var layers = [
      new ol.layer.Tile({
        source: new ol.source.OSM(),
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

    let theExtent = this.props.theExtent ?
      this.props.theExtent :
      [-16573993.717131337, -7827151.696402049, 16573993.717131337, 7827151.696402049]
    this.map.getView().fit(theExtent)
  }

  componentDidMount() {
    this.serveMap()
    this.map.on('moveend', () => { this.props.onComplete(this.map.getView().calculateExtent())})
  }

  componentWillUnmount() {
    this.props.onComplete(this.map.getView().calculateExtent())
  }

  renderHeader() {
    return (
      <div className="row">
        <div className="col-xs-5 col-md-4">
          <h4>{this.props.title}</h4>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderHeader()}
        <hr/>
        <div
          ref={m => this.mapId = m}
          className="map"
          style={{ width: '100%', height: '400px' }}></div>
      </div>
    )
  }
}