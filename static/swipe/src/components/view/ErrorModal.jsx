import Modal from 'react-modal'
import PropTypes from 'prop-types'
import React from 'react'


const DefaultModalStyle = {
  overlay: {
      position: 'fixed',
      // top: '3.5em',
      left: '0px',
      right: '0px',
      bottom: '0px',
      backgroundColor: 'rgba(101, 100, 100, 0.75)',
      zIndex: 100000,
  },
  content: {
      outline: 'none',
      // width: "80%",
      overflow: 'hidden',
      // margin: 'auto',
  }
}

export const ErrorModal=(props)=> {
    const {open,onRequestClose,error}=props
    return (
        <Modal className="modal-dialog" isOpen={open} style={DefaultModalStyle} onRequestClose={onRequestClose}>
            <div className="">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div className="row">
                            <div className="col-xs-6 col-md-6">
                                <h3>Error</h3>
                            </div>
                            <div className="col-xs-1 col-md-1 col-md-offset-5 col-xs-offset-5">
                                <div className="pull-right">
                                    <a className="btn btn btn-primary" onClick={(e) => {
                                        e.preventDefault()
                                        onRequestClose()
                                    }}><i className="fa fa-times" aria-hidden="true"></i>                                        </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="panel-body">
                        <div className="row">
                            <div className="col-md-12 text-center text-danger">
                                <div>{error}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
ErrorModal.propTypes={
    error:PropTypes.string.isRequired,
    onRequestClose:PropTypes.func.isRequired,
    open:PropTypes.bool.isRequired
}