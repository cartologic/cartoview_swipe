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
        <div className="col-xs-7 col-md-8">
          <button
            style={{
            display: "inline-block",
            margin: "0px 3px 0px 3px"
            }}
            className={this.props.app_instance_id ? "btn btn-primary btn-sm pull-right": "btn btn-primary btn-sm pull-right disabled"}
            onClick={()=>window.location.href=`${site_url}apps/${app_name}/${this.props.app_instance_id}/view`}>
            {"View"}
          </button>
          <button
            style={{
            display: "inline-block",
            margin: "0px 3px 0px 3px"
            }}
            className={"btn btn-primary btn-sm pull-right"}
            onClick={()=>{this.props.save(this.map.getView().calculateExtent())}}>
            {"Save"}
          </button>
          <button
            style={{
            display: "inline-block",
            margin: "0px 3px 0px 3px"
            }}
            className="btn btn-primary btn-sm pull-right"
            onClick={()=>{this.props.stepBack()}}>
            {"<< Prev"}
          </button>
          {this.props.savingIndicator && <div className="loading"></div>}
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