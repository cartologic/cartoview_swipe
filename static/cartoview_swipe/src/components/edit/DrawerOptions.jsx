import React, { Component } from 'react'
import PropTypes from 'prop-types'
import t from 'tcomb-form'
import '../../css/drawerOptions.css'
const UrlFrom = t.struct( {
    urlRadio: t.enums( {
        specificUrl: 'URL'
    } ),
} )
const HomeButtonOptions = t.struct( {
    viewHomeButton: t.Boolean,
    redirectOptions: t.enums( {
        appHome: 'Go To App Home',
        portalHome: 'Go To Portal Home',
        specificUrl: 'URL'
    } ),
    urlText: t.maybe(t.String)
} )
const formConfig = t.struct( {
    defaultDrawerOpen: t.Boolean,
    homeButton: HomeButtonOptions,
} )
const Form = t.form.Form
export default class DrawerOptions extends Component {
    constructor( props ) {
        super( props )
        this.state = {
            defaultConfig: this.props.defaultDrawerOptions,
        }
    }
    getComponentValue = () => {
        return this.form.getValue()
    }
    getFormOptions() {
        const defaultConfig = this.state.defaultConfig
        const options = {
            fields: {
                defaultDrawerOpen: {
                    label: "Default Drawer Open",
                },
                homeButton: {
                    label: true,
                    fields: {
                        viewHomeButton: {
                            label: "View Home Button",
                        },
                        redirectOptions: {
                            label: 'Redirect Options',
                            factory: t.form.Radio,
                            disabled: !defaultConfig.homeButton.viewHomeButton,
                        },
                        urlText: {
                            label: true,
                            factory: t.form.Url,
                            disabled: !( defaultConfig.homeButton.viewHomeButton &&
                                defaultConfig.homeButton.redirectOptions ===
                                'specificUrl' ),
                            attrs: {
                                className: 'urlInput'
                            }
                        }
                    },
                },
            }
        }
        return options
    }
    onChange( value ) {
        this.setState( { defaultConfig: value }, () => {
            // this.props.onComplete( this.state.defaultConfig )
        } )
    }
    componentDidUpdate() {
        if ( this.props.error ) { this.refs.form.getValue() }
    }
    // componentWillUnmount() {
    //     this.props.onComplete( this.state.defaultConfig )
    // }
    render() {
        return (
            <div>
        <div className="row">
          <div className="col-xs-5 col-md-4">
            <h4>{'Drawer Options'}</h4>
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
DrawerOptions.propTypes = {
    defaultDrawerOptions: PropTypes.object.isRequired,
    // onComplete: PropTypes.func.isRequired,
}
