import PropTypes from 'prop-types'
import React from 'react'
import classnames from 'classnames'

import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import CameraIcon from 'material-ui-icons/PhotoCamera'
import HomeIcon from 'material-ui-icons/Home'
import ImageIcon from 'material-ui-icons/Image'
import InfoIcons from 'material-ui-icons/Info'
import LayersIcons from 'material-ui-icons/Layers'
import Paper from 'material-ui/Paper'
import ExpansionPanel, {
    ExpansionPanelSummary,
    ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import Typography from 'material-ui/Typography';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Radio, { RadioGroup } from 'material-ui/Radio';
import {FormControlLabel} from 'material-ui/Form';
import { withStyles } from 'material-ui/styles'

import NavBar from './NavBar.jsx'
import CartoviewAbout from './About.jsx'

const styles = theme => ( {
    root: {
        height: "100%",
        overflowY: 'overlay',
        position: 'fixed',
        width: '300px'
    },
    noRoot: {
        display : 'none'
    },
    drawerPaper: {
        // position: 'fixed',
        width: '300px'
    },
    expansionPanelDetails: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    layerOpcity: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingBottom: '15px',
    }
} )
class CartoviewDrawer extends React.Component {
    state = {
        drawerOpen: this.props.drawerOpen,
        about: false,

        layerLeftOpacity: 1,
        layerRightOpacity: 1,

        baseMapRadioValue: 'OSMBaseMap'
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.setState({drawerOpen: nextProps.drawerOpen})
        }
    }

    handleAboutChange = () => {
        const { about } = this.state
        this.setState( { about: !about } )
    }

    handleRadioChange(e, value) {
        let previousMapSelection = this.state.baseMapRadioValue
        this.setState({ baseMapRadioValue: value }, () => {
            this.props.setBaseMap(this.state.baseMapRadioValue, previousMapSelection)
        })
    }

    handleOpacityChange(layer, value) {
        this.setState(
            {[`${layer}Opacity`]: value},
            () => {
                // console.log(`${layer}Opacity Changed`, this.state[`${layer}Opacity`])
                this.props.setLayerOpacity(layer, value)
            }
        )
    }

    getRedirectURL() {
        if (this.props.drawerOptions) {
            switch (this.props.drawerOptions.homeButton.redirectOptions) {
                case 'appHome':
                  return URLS.appInstancesPage
                  break;
                case 'portalHome':
                  return URLS.portalHome
                  break;
                case 'specificUrl':
                  return this.props.drawerOptions.homeButton.urlText
                  break;
              }
        }
    }

    renderLayersOpacitySlider() {
        const classes = this.props.classes
        return (
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography type="subheading">Layer Opacity</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                    <div className={classes.layerOpcity + ' layer-opacity-slider'}>
                        <Typography type="body1">{`${layerLeftTitle}`}</Typography>
                        <input type="range" onChange={(e) => { this.handleOpacityChange('layerLeft', e.target.value) }} value={this.state.layerLeftOpacity} min={0} max={0.99} step={0.01} />
                    </div>
                    <div className={classes.layerOpcity + ' layer-opacity-slider'}>
                        <Typography type="body1">{`${layerRightTitle}`}</Typography>
                        <input type="range" onChange={(e) => { this.handleOpacityChange('layerRight', e.target.value) }} value={this.state.layerRightOpacity} min={0} max={0.99} step={0.01} />
                    </div>    
                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }

    renderBaseMapSwitcher() {
        const classes = this.props.classes
        return (
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography type="subheading">Base Map Layer Switcher</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <RadioGroup aria-label="gender" name="gender1" className={classes.group} value={this.state.baseMapRadioValue} onChange={this.handleRadioChange.bind(this)}>                    
                        {
                            this.props.baseMapOptions
                            && this.props.baseMapOptions.map((o, i) => {
                                return (
                                    <FormControlLabel key={i} value={o} control={<Radio />} label={o} />
                                )
                            })
                        }
                    </RadioGroup>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        )
    }

    render() {       
        const {
            classes,
            className,
            // legends,
            // urls,
            // mapLayers,
            // changeLayerOrder,
            // handleLayerVisibilty,
            config,
            exportMap
        } = this.props

        return (
            <Paper elevation={6} className={this.state.drawerOpen ? classes.root : classes.noRoot}>
                <NavBar config={this.props.config} />
                <Paper className={classes.drawerPaper} elevation={0}>
                    <List>
                        {
                            this.props.drawerOptions.homeButton.viewHomeButton && 
                            <ListItem onClick={() => window.location.href = this.getRedirectURL()} button>
                                <ListItemIcon>
                                    <HomeIcon />
                                </ListItemIcon>
                                <ListItemText primary="Home" />
                            </ListItem>
                        }
                        <ListItem onClick={()=>this.handleAboutChange()} button>
                            <ListItemIcon>
                                <InfoIcons />
                            </ListItemIcon>
                            <ListItemText primary="About" />
                        </ListItem>
                        <ListItem onClick={()=>{this.props.exportMap()}} button>
                            <ListItemIcon>
                                <CameraIcon />
                            </ListItemIcon>
                            <ListItemText primary="Export Map" />
                        </ListItem>
                        {this.renderLayersOpacitySlider()}
                        {this.renderBaseMapSwitcher()}
                        <CartoviewAbout
                            open={this.state.about}
                            title={config.formTitle}
                            abstract={config.formAbstract}
                            close={()=>{this.handleAboutChange()}} />
                    </List>
                </Paper>
            </Paper >
        )
    }
}

// CartoviewDrawer.propTypes = {
//     classes: PropTypes.object.isRequired,
//     className: PropTypes.string.isRequired,
//     changeLayerOrder: PropTypes.func.isRequired,
//     legends: PropTypes.array.isRequired,
//     urls: PropTypes.object.isRequired,
//     mapLayers: PropTypes.array.isRequired,
//     handleLayerVisibilty: PropTypes.func.isRequired,
//     exportMap: PropTypes.func.isRequired,
//     config: PropTypes.object.isRequired
// }
export default withStyles( styles )( CartoviewDrawer )