import React from 'react'
import PropTypes from 'prop-types'
import Spinner from 'react-spinkit'
import Img from 'react-image'
import Select from 'react-select'
class OptionComponent extends React.Component {
    render() {
        return (
            <div className={'select-option-container'} 
            onClick={(e)=>{this.props.onSelect(this.props.option, event)}}
            style={{display: 'flex', flexDirection:'row', alignItems:"center", cursor: "pointer", margin:'5px 0'}}>
              <img src={this.props.option.thumbnail_url} alt="" style={{height: '70px', width: '70px'}}/>
              <div style={{marginLeft: "15px"}}> <h6>{this.props.option.label}</h6> </div>
            </div>
        )
    }
}
const MapCard = ( props ) => {
    const { selectedMap } = props
    return (
        <div
          className={"row row-fix resource-box map-card"}>

          <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4 resource-box-img-container">
              <Img
                  className="resource-box-img"
                  src={[selectedMap.thumbnail_url, "/static/app_manager/img/no-image.jpg"]}
                  loader={< Spinner name="line-scale-pulse-out" color="steelblue" />} />
          </div>

          <div className="col-xs-12 col-sm-8 col-md-8 col-lg-8 resource-box-text">
              <h4>{selectedMap.title}</h4>
              <hr></hr>
              <p>
                  {selectedMap.abstract.length > 30
                      ? selectedMap.abstract.substr(0, 30) + '...'
                      : selectedMap.abstract}
              </p>
              <p>owner: {selectedMap.owner__username}</p>
              <a type="button"
                  href={`/maps/${selectedMap.id}`}
                  target="_blank"
                  className="btn btn-primary map-details-button">
                  {'Map Details'}
              </a>
          </div>
      </div>
    )
}
MapCard.propTypes = {
    selectedMap: PropTypes.object
}
export default class SwipeStep extends React.Component {
    state = {}
    componentWillReceiveProps( nextProps ) {
        if ( this.props !== nextProps ) {
            if(nextProps.mapLayers !== this.state.mapLayers){
                let mapLayers = nextProps.mapLayers
                let options = mapLayers.map( ( layer ) => {
                    return ( {
                        value: layer.typename,
                        label: layer.title,
                        thumbnail_url: layer.thumbnail_url,
                    } )
                } )
                this.setState( { 
                    options: options, 
                    selectedOption: this.initialSelectedMap === nextProps.selectedMap ? nextProps.selectedLayer || options[0] : options[0], 
                    mapLayers: mapLayers 
                } )
            }
        }
    }
    componentDidMount(){
        this.initialSelectedMap = this.props.selectedMap
    }
    getComponentValue() {
        return this.state.selectedOption
    }
    renderHeader() {
        return ( <h4>{"Swipe Options"}</h4> )
    }
    renderMapCard() {
        return (
            <div className={'map-card-container'}>
                <h6>Based on the selected map,</h6>
                {this.props.selectedMap && <MapCard selectedMap={this.props.selectedMap}/>}
            </div>
        )
    }
    renderLayerSelector() {
        return (
            <div>
            <hr/>
            <h6>Select layer to apply swipe on:</h6>
            <Select 
                value={ this.state.selectedOption } 
                optionComponent={OptionComponent} options={this.state.options}
                onChange={(value)=>{this.setState({selectedOption: value})}}
            />
            </div>
        )
    }
    renderErrorMessage(){
        return(
            <div className="panel panel-danger" style={{margin: '10px 0px'}}>
                <div className="panel-heading">
                    <h5 className="panel-title">No Layers!</h5>
                </div>
                <div className="panel-body">
                    <h6>The selected map has no layers, Please add layers to the map or select an other map</h6>
                </div>
            </div>
        )
    }
    render() {
        return (
            <div>
        {this.renderHeader()}
        <hr/>
        {this.renderMapCard()}
        {this.props.errors.indexOf(1) !== -1 && this.renderErrorMessage()}
        {this.renderLayerSelector()}
      </div>
        )
    }
}
SwipeStep.propTypes = {}
