import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { default as WizardSteper } from './components/EditModeNavigator.jsx'
import { default as ResourceSelector } from './components/ResourceSelector.jsx'
import { default as General } from './components/General.jsx'
import { default as MapExtent } from './components/MapExtent.jsx'
import {default as SelectionsBox} from './components/UserSelections.jsx'

import './css/style.css'
import { validate } from 'tcomb-validation';

export default class newAppInstance extends React.Component {
  state = {
    step: 0,
    errors: [],

    app_instance_id: undefined,
    // general step default config
    title: "",
    abstract: "",
    access: "public",

    // selecl left layer step
    layerLeft: undefined,

    // selecl right layer step
    layerRight: undefined,


    // set extent step
    theExtent: [-16573993.717131337, -7827151.696402049, 16573993.717131337, 7827151.696402049],
  }

  goToStep(step) {
    this.setState({step});
  }

  validateConfig(instanceConfig) {
    let a = []
    if (instanceConfig.title === "") {
      a.push(0)
    }
    if (instanceConfig.config.layerLeft === undefined) {
      a.push(1)
    }
    if (instanceConfig.config.layerRight === undefined) {
      a.push(2)
    }
    this.setState({ errors: a })
    
    if (a.length === 0) return true
    return false
  }

  saveAppInstance() {
    let instanceConfig = {
      title: this.state.title,
      abstract: this.state.abstract,
      config: {
        access: this.state.access,
        layerLeft: this.state.layerLeft,
        layerRight: this.state.layerRight,
        theExtent: this.state.theExtent
      }
    }
    if (this.validateConfig(instanceConfig)) {
      let url = URLS.new;
      fetch(url, {
        method: 'POST',
        credentials: "same-origin",
        headers: new Headers({"Content-Type": "application/json; charset=UTF-8", "X-CSRFToken": CSRF_TOKEN}),
        body: JSON.stringify(instanceConfig)
      })
        .then((response) => response.json())
        .then(data=> this.setState({app_instance_id: data.id, savingIndicator: false}))
    }else {
      this.setState({savingIndicator: false})
    }
  }

  getSelections() {
    let a = []
    if (this.state.layerLeft) {
      a.push({
        title: "Left Layer",
        layer: this.state.layerLeft
      })
    }
    if (this.state.layerRight) {
      a.push(
        {
          title: "Right Layer",
          layer: this.state.layerRight
        }  
      )
    }
    return a
  }

  renderHeader() {
    return (
      <div className={'save-view-box'}>
        <button
          style={{
          display: "inline-block",
          margin: "0px 3px 0px 3px"
          }}
          className={this.state.app_instance_id ? "btn btn-primary btn-sm pull-right": "btn btn-primary btn-sm pull-right disabled"}
          onClick={()=>window.location.href=`${site_url}apps/${app_name}/${this.state.app_instance_id}/view`}>
          {"View"}
        </button>
        <button
          style={{
          display: "inline-block",
          margin: "0px 3px 0px 3px"
          }}
          className={"btn btn-primary btn-sm pull-right"}
          onClick={()=>{this.saveAppInstance()}}>
          {"Save"}
        </button>
        {this.state.savingIndicator && <div className="loading"></div>}
        <SelectionsBox
          selections={this.getSelections()}  
        />  
      </div>
    )
  }

  render() {
    const steps = [
      {
        label: "General",
        component: General,
        props: {
          title: this.state.title,
          abstract: this.state.abstract,
          access: this.state.access,
          onComplete: (data) => {
            this.setState({
              title: data.title,
              abstract: data.abstract,
              access: data.access,
            })
          },
          stepForward: () => {
            this.goToStep(this.state.step + 1)
          },
          error: this.state.errors.indexOf(0) !== -1 
        },
      },
      {
        label: "Select Left Layer",
        component: ResourceSelector,
        props: {
          resourcesApiUrl: URLS.layersApiUrl,
          searchResourcesApiUrl: URLS.searchByTitleApiUrl,
          title: 'Select Left Layer',
          selectedResource: this.state.layerLeft,
          onComplete: (layer) => {
            this.setState({layerLeft: layer})
          },
          stepBack: () => {
            this.goToStep(this.state.step - 1)
          },
          stepForward: () => {
            this.goToStep(this.state.step + 1)
          }
        },
      },
      {
        label: "Select Right Layer",
        component: ResourceSelector,
        props: {
          resourcesApiUrl: URLS.layersApiUrl,
          searchResourcesApiUrl: URLS.searchByTitleApiUrl,
          title: 'Select Right Layer',
          selectedResource: this.state.layerRight,
          onComplete: (layer) => {
            this.setState({layerRight: layer})
          },
          stepBack: () => {
            this.goToStep(this.state.step - 1)
          },
          stepForward: () => {
            this.goToStep(this.state.step + 1)
          }
        },
      },
      {
        label: "Set Extent",
        component: MapExtent,
        props: {
          title: "Set Map Extent",
          theExtent: this.state.theExtent,
          app_instance_id: this.state.app_instance_id,
          savingIndicator: this.state.savingIndicator,
          stepBack: () => {
            this.goToStep(this.state.step - 1)
          },
          onComplete: (theExtent) => {
            this.setState({theExtent:theExtent})
          },
        }
      },
    ]
    const step = this.state.step
    return (
      <div>
        {this.renderHeader()}
        <WizardSteper
          errors = {this.state.errors}  
          steps={steps}
          step={step}
          onStepSelected={(step) => {this.goToStep(step)}} />
        <div className="col-xs-12 col-sm-12 col-md-9 col-lg-9 right-panel">
          {
            steps.map((s, index) => { 
              if (index == step) return (
                <s.component key={index} {...s.props} />
              )  
            }
            )
          }
        </div>
      </div>
    )
  }
}

global.newAppInstance = newAppInstance;
global.React = React;
global.ReactDOM = ReactDOM;