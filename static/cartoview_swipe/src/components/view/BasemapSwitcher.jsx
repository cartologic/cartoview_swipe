import List, { ListItem, ListItemSecondaryAction } from 'material-ui/List'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'

import Checkbox from 'material-ui/Checkbox'
import IconButton from 'material-ui/IconButton'
import ListSubheader from 'material-ui/List/ListSubheader'
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormControlLabel } from 'material-ui/Form';
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
const radioButtons = (basemapLayers, state, handleRadioChange) => {
    let visableMap = null
    basemapLayers.map(lyr => {
        if (lyr.getVisible()) {
            visableMap = lyr.getProperties().name
        }
    })
    return (
        <RadioGroup
            name="basemaps_radio_buttons"
            value={visableMap}
            onChange={(e) => { handleRadioChange(e.target.value) }}>
            {
                basemapLayers.map((o, i) => {
                    return (
                        <FormControlLabel key={i} value={o.get('name')} control={<Radio />} label={o.get('title')} />
                    )
                })
            }
        </RadioGroup>
    )
}
class CartoviewLayerSwitcher extends React.Component {
    state = {
        basemapRadioValue: this.props.visibleBasemapName,
    }
    handleRadioChange(value) {
        this.setState(
            { basemapRadioValue: value },
            () => {
                this.props.handleLayerVisibilty(this.state.basemapRadioValue)
            }
        )
    }
    render() {
        const {
            classes,
            mapLayers,
            handleLayerVisibilty
        } = this.props
        return (
            <Paper className={classes.legendsPaper} elevation={0}>
                {mapLayers.length > 0 && radioButtons(mapLayers, this.state, this.handleRadioChange.bind(this))}
                {mapLayers.length == 0 && <Message message="No Layers" align="center" type="body1" />}
            </Paper>
        )
    }
}
CartoviewLayerSwitcher.propTypes = {
    classes: PropTypes.object.isRequired,
    mapLayers: PropTypes.array.isRequired,
    handleLayerVisibilty: PropTypes.func.isRequired,
    visibleBasemapName: PropTypes.string.isRequired,
}
export default withStyles(styles)(CartoviewLayerSwitcher)
