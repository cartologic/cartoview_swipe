import React, {Component} from 'react';
import t from 'tcomb-form';

const Access = t.enums({
  public: 'Public', private: 'Private (only me)',
});
const mapConfig = t.struct({title: t.String, abstract: t.String, access: Access});
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

  componentWillUnmount() {
    var basicConfig = this.refs.form.getValue();
    if(basicConfig === null) return false
    this.props.onComplete(basicConfig)
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-xs-5 col-md-4">
            <h4>{'General'}</h4>
          </div>
          <div className="col-xs-7 col-md-8">
            <button
              style={{
              display: "inline-block",
              margin: "0px 3px 0px 3px"
              }}
              className="btn btn-primary btn-sm pull-right"
              onClick={this.onNext.bind(this)}>
              {"next >>"}
            </button>
          </div>
        </div>

        <hr></hr>

        <Form ref="form" value={this.state.defaultConfig} type={mapConfig} options={options}/>
      </div>
    )
  }
}
