import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Snackbar from 'material-ui/Snackbar'
import Fade from 'material-ui/transitions/Fade'
import { Loader } from '../containers/CommonComponents.jsx'

const SnackMessage = (props) => {
  const { message } = props
  return <span className="element-flex" id="message-id"><Loader size={20} thickness={4} /> {message} </span>
}
SnackMessage.propTypes = {
  message: PropTypes.string.isRequired
}

const CartoviewSnackBar = (props) => {
  const { handleClose, open, message } = props
  const messageComponent = <SnackMessage message={message} />
  return <Snackbar
      open={open}
      // onRequestClose={handleClose ? handleClose : () => { }}
      transition={Fade}
      SnackbarContentProps={{
          'aria-describedby': 'message-id',
      }}
      message={messageComponent} />
}
CartoviewSnackBar.propTypes = {
  handleClose: PropTypes.func,
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired
}

export default CartoviewSnackBar