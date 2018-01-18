import List, { ListItem, ListItemSecondaryAction } from 'material-ui/List'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'

import Checkbox from 'material-ui/Checkbox'
import IconButton from 'material-ui/IconButton'
import ListSubheader from 'material-ui/List/ListSubheader'
import { Message } from 'Source/containers/CommonComponents'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React from 'react'
import ZoomIcon from 'material-ui-icons/ZoomIn'
import { withStyles } from 'material-ui/styles'

import '../../css/layerswitcher.css'

const styles = theme => ({
    legendsPaper: {
        padding: theme.spacing.unit * 2,
    }
})
const opacitySlider = (layer) =>{
    return (
        <input 
        type="range" 
        onChange={(e) => { layer.setOpacity(e.target.value) }} 
        min={0} max={1} step={0.01} />
    )
}
const LayerItem = SortableElement(({ layer, layerIndex, handleLayerVisibilty }) => {
    return (
        <div className={'drawer-layer-item'}>
            <ListItem className="layer-switcher-item dense" button>
                <Checkbox
                    checked={layer.getVisible()}
                    tabIndex={-1}
                    onChange={handleLayerVisibilty(layerIndex)}
                    disableRipple
                />
                <Message message={layer.getProperties().title} wrap={false} align="left" type="body1" />
            </ListItem>
            {opacitySlider(layer)}
        </div>
    )
})
const LayerList = SortableContainer(({ layers, handleLayerVisibilty }) => {
    return (
        <List subheader={<ListSubheader>{`Drag layers to order`}</ListSubheader>}>
            {layers.map((layer, index) => (
                <LayerItem handleLayerVisibilty={handleLayerVisibilty} key={`item-${index}`} index={index} layerIndex={index} layer={layer} />
            ))}
        </List>
    )
})
class CartoviewLayerSwitcher extends React.Component {
    render() {
        const {
            classes,
            mapLayers,
            changeLayerOrder,
            handleLayerVisibilty
        } = this.props
        return (
            <Paper className={classes.legendsPaper} elevation={0}>
                {mapLayers.length > 0 && <LayerList layers={mapLayers} handleLayerVisibilty={handleLayerVisibilty} helperClass="sortable-container" onSortEnd={changeLayerOrder} />}
                {mapLayers.length == 0 && <Message message="No Layers" align="center" type="body1" />}
            </Paper>
        )
    }
}
CartoviewLayerSwitcher.propTypes = {
    classes: PropTypes.object.isRequired,
    mapLayers: PropTypes.array.isRequired,
    changeLayerOrder: PropTypes.func.isRequired,
    handleLayerVisibilty: PropTypes.func.isRequired
}
export default withStyles(styles)(CartoviewLayerSwitcher)
