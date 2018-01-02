import React, {Component} from 'react';
import t from 'tcomb-form';

const UrlFrom = t.struct({
  urlRadio: t.enums({
    specificUrl: 'URL'
  }),
  
})
const HomeButtonOptions = t.struct({
  viewHomeButton: t.Boolean,
  redirectOptions: t.enums({
    appHome: 'Go To App Home',
    portalHome: 'Go To Portal Home',
    specificUrl: 'URL'
  }),
  urlText: t.String
})
const formConfig = t.struct({
  defaultDrawerOpen: t.Boolean,
  homeButton: HomeButtonOptions,
})
const Form = t.form.Form;

export default class DrawerOptions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      defaultConfig: this.props.defaultDrawerOptions,
    }
  }

  getFormOptions() {
    const defaultConfig = this.state.defaultConfig;
    console.log()
    const options = {
      fields: {
        defaultDrawerOpen: {
          label: "Default Drawer Open",
        },
        homeButton: {
          label: 'Home Button Options',
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
              label: 'URL',
              factory: t.form.Url,
              disabled: !(defaultConfig.homeButton.viewHomeButton && defaultConfig.homeButton.redirectOptions === 'specificUrl')
            }
          },
        },
      }
    }

    return options
  }

  onChange(value) {
    this.setState({ defaultConfig: value }, ()=>{this.props.onComplete(this.state.defaultConfig)})
  }

  componentDidUpdate() {
    if(this.props.error){this.refs.form.getValue()}
  }

  componentWillUnmount() {
    this.props.onComplete(this.state.defaultConfig)
  }

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
