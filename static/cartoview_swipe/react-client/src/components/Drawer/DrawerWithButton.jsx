import React from 'react'
import PropTypes from 'prop-types'

import classnames from 'classnames'

import ArrowLeft from 'material-ui-icons/KeyboardArrowLeft'
import ArrowRight from 'material-ui-icons/KeyboardArrowRight'
import Paper from 'material-ui/Paper'
import IconButton from 'material-ui/IconButton'
import { withStyles } from 'material-ui/styles'

import Drawer from './Drawer.jsx'

const styles = theme => ({
    drawerButton: {
      position: 'fixed',
      marginLeft: '300px',
      marginTop: '10px',
    },
    drawerClosedButton: {
      position: 'fixed',
      marginLeft: '0px',
      marginTop: '10px',
  },
  iconDrawerButton: {
    width: '30px'
  }
  })

class DrawerWithButton extends React.Component {
  state = {
    drawerOpen: this.props.drawerOpen,
  }

  onClick() {
    this.state.drawerOpen ?
      this.props.handleDrawerClose():
      this.props.handleDrawerOpen()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState({drawerOpen: nextProps.drawerOpen})
    }
  }

  render() {
    const classes = this.props.classes
    return (
      <div>
        <Paper className={this.state.drawerOpen ? classes.drawerButton : classes.drawerClosedButton}>
          <IconButton
            onClick = {()=>{this.onClick()}}
            color="default" aria-label="add" className={classes.iconDrawerButton}>
            {this.state.drawerOpen ? <ArrowLeft /> : <ArrowRight />}
          </IconButton>
        </Paper>
        <Drawer
          drawerOpen={this.state.drawerOpen}
          drawerOptions={this.props.drawerOptions}
          config={this.props.config}
          exportMap={() => { this.props.exportMap() }}
          baseMapOptions={this.props.baseMapOptions}
          setBaseMap = {(currentBaseMap, previousBaseMap)=>{this.props.setBaseMap(currentBaseMap, previousBaseMap)}}
        />
      </div>
    )
  }
}
DrawerWithButton.propTypes = {
    classes: PropTypes.object.isRequired,
}
export default withStyles(styles, { withTheme: true })(DrawerWithButton)