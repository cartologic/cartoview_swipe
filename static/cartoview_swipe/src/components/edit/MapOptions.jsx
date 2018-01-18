import React, { Component } from 'react'
import PropTypes from 'prop-types'

import t from 'tcomb-form'
const formConfig = t.struct( {
    enableIdentify: t.Boolean,
} )
const Form = t.form.Form
export default class MapOptions extends Component {
    constructor( props ) {
        super( props )
        this.state = {
            defaultConfig: this.props.defaultMapOptions,
        }
    }
    getFormOptions() {
        const defaultConfig = this.state.defaultConfig
        const options = {
            fields: {
                enableIdentify: {
                    label: "Enable Feature Identify",
                },
            }
        }
        return options
    }
    onChange( value ) {
        this.setState( { defaultConfig: value } )
    }
    componentDidUpdate() {
        if ( this.props.error ) { this.refs.form.getValue() }
    }
    getComponentValue = () => {
        return this.form.getValue()
    }
    // componentWillUnmount() {
    //   this.props.onComplete(this.state.defaultConfig)
    // }
    render() {
        return (
            <div>
        <div className="row">
          <div className="col-xs-5 col-md-4">
            <h4>{'Map Options'}</h4>
          </div>
        </div>

        <hr></hr>

        <Form
          ref={form=>this.form = form}
          value={this.state.defaultConfig}
          type={formConfig}
          options={()=>{return this.getFormOptions()}}
          onChange={this.onChange.bind(this)} />
      </div>
        )
    }
}

MapOptions.propTypes = {
  defaultMapOptions: PropTypes.object.isRequired,
}
