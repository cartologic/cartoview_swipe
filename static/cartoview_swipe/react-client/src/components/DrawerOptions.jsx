import React, {Component} from 'react';
import t from 'tcomb-form';

const formConfig = t.struct({
  defaultDrawerOpen: t.Boolean
});
const options = {
  fields: {
    defaultDrawerOpen: {
      label: "Default Drawer Open",
    },
  }
};
const Form = t.form.Form;

export default class DrawerOptions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      defaultConfig: {
        defaultDrawerOpen: this.props.defaultDrawerOpen,
      }
    }
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
          ref="form"
          value={this.state.defaultConfig}
          type={formConfig}
          options={options}
          onChange={this.onChange.bind(this)} />
      </div>
    )
  }
}
