import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { default as WizardSteper } from './components/EditModeNavigator.jsx'
import { default as ResourceSelector } from './components/ResourceSelector.jsx'
import { default as General } from './components/General.jsx'
import { default as MapExtent } from './components/MapExtent.jsx'

import './css/style.css'

export default class editAppInstance extends React.Component {
  state = {
    step: 3,
    app_instance_id: app_instance_id,
    // general step default config
    title: app_instance_title,
    abstract: app_instance_abstract,
    access: app_instance_config.access,

    // selecl left layer step
    layerLeft: app_instance_config.layerLeft,

    // selecl right layer step
    layerRight: app_instance_config.layerRight,
    
    // set extent step
    theExtent: app_instance_config.theExtent
  }

  goToStep(step) {
    this.setState({step});
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
    let url = URLS.edit;
    fetch(url, {
      method: 'POST',
      credentials: "same-origin",
      headers: new Headers({"Content-Type": "application/json; charset=UTF-8", "X-CSRFToken": CSRF_TOKEN}),
      body: JSON.stringify(instanceConfig)
    })
      .then((response) => response.json())
      .then(data=> this.setState({savingIndicator: false}))
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
          selectedIndex: this.state.layerLeftIndex,
          onComplete: (layer, index) => {
            this.setState({layerLeft: layer, layerLeftIndex: index})
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
          selectedIndex: this.state.layerRightIndex,
          onComplete: (layer, index) => {
            this.setState({layerRight: layer, layerRightIndex: index})
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
          save: (theExtent) => {
            this.setState({ theExtent: theExtent, savingIndicator: true }, () => {
              this.saveAppInstance()
            })
          }
        }
      },
    ]
    const step = this.state.step
    return (
      <div>
        <WizardSteper
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

global.editAppInstance = editAppInstance;
global.React = React;
global.ReactDOM = ReactDOM;