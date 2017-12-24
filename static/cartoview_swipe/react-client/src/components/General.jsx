import React, {Component} from 'react';
import t from 'tcomb-form';

const Access = t.enums({
  public: 'Public', private: 'Private (only me)',
});
const formConfig = t.struct({title: t.String, abstract: t.maybe(t.String), access: Access});
const options = {
  fields: {
    title: {
      label: "App Title"
    },
    abstract: {
      type: 'textarea'
    },
    access: {
      factory: t.form.Radio
    }
  }
};
const Form = t.form.Form;

export default class General extends Component {
  constructor(props) {
    super(props)
    this.state = {
      defaultConfig: {
        title: this.props.title,
        abstract: this.props.abstract,
        access:  this.props.access // "private" or "public"
      }
    }
  }

  onNext() {
    var basicConfig = this.refs.form.getValue();
    basicConfig !== null && this.props.stepForward();
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
            <h4>{'General'}</h4>
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
