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
    }
} )
class CartoviewDrawer extends React.Component {
    state = {
        drawerOpen: this.props.drawerOpen,
        about: false,
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

    renderBaseMapSwitcher() {
        const classes = this.props.classes
        return (
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>Base Map Layer Switcher</Typography>
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
                        <ListItem onClick={() => window.location.href = URLS.appInstancesPage} button>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItem>
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