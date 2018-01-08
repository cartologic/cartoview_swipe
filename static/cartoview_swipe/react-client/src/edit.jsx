import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { default as WizardSteper } from './components/EditModeNavigator.jsx'
import { default as ResourceSelector } from './components/ResourceSelector.jsx'
import { default as General } from './components/General.jsx'
import { default as MapExtent } from './components/MapExtent.jsx'
import { default as SelectionsBox } from './components/UserSelections.jsx'
import { default as AppAccess } from './components/Access.jsx'
import { default as DrawerOptions } from './components/DrawerOptions.jsx'
import { default as MapOptions } from './components/MapOptions.jsx'

import {doGet} from './components/utils.jsx'

import './css/style.css'

import { getPropertyFromConfig, getSelectOptions } from './containers/staticMethods.jsx'
const getFormValue = (config) => {
  const viewAccess = getPropertyFromConfig(config ? config.access :
    null, 'whoCanView', null)
  const metadataAccess = getPropertyFromConfig(config ?
    config.access : null, 'whoCanChangeMetadata',
    null)
  const deleteAccess = getPropertyFromConfig(config ? config.access :
    null, 'whoCanDelete', null)
  const changeAccess = getPropertyFromConfig(
    config ? config.access : null,
    'whoCanChangeConfiguration', null)
  const value = {
    whoCanView: viewAccess ? getSelectOptions(viewAccess) : viewAccess,
    whoCanChangeMetadata: metadataAccess ? getSelectOptions(metadataAccess) : metadataAccess,
    whoCanDelete: deleteAccess ? getSelectOptions(deleteAccess) : deleteAccess,
    whoCanChangeConfiguration: changeAccess ? getSelectOptions(changeAccess) : changeAccess,
  }
  return value
}

export default class editAppInstance extends React.Component {
  state = {
    step: 3,
    errors: [],
    
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
    theExtent: app_instance_config.theExtent,

    // access config step
    profiles: undefined,
    accessConfig: getFormValue(app_instance_config),

    // Drawer Options Step
    drawerOptions: app_instance_config.drawerOptions,

    // Map Options Step
    mapOptions: app_instance_config.mapOptions,
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

  getProfiles = () => {
    const url = URLS.profilesAPI
    doGet(url).then(result => {
      this.setState({
        profiles: result.objects,
      })
    })
  }

  componentDidMount() {
    this.getProfiles();
  }

  flattenedUsers = (users) => {
    return users.map(obj => obj.value)
  }

  getFormValueForSaving = (value) => {
    let data = {}
    Object.keys(value).map(attr => {
      const attributeValue = value[attr]
      data[attr] = attributeValue ? this.flattenedUsers(attributeValue) : null
    })
    return data
  }

  saveAppInstance() {
    let instanceConfig = {
      title: this.state.title,
      abstract: this.state.abstract,
      config: {
        access: this.state.access,
        layerLeft: this.state.layerLeft,
        layerRight: this.state.layerRight,
        theExtent: this.state.theExtent,
        access: this.getFormValueForSaving(this.state.accessConfig),
        drawerOptions: this.state.drawerOptions,
        mapOptions: this.state.mapOptions,
      }
    }
    if (this.validateConfig(instanceConfig)) {
      let url = URLS.edit;
      fetch(url, {
        method: 'POST',
        credentials: "same-origin",
        headers: new Headers({"Content-Type": "application/json; charset=UTF-8", "X-CSRFToken": CSRF_TOKEN}),
        body: JSON.stringify(instanceConfig)
      })
        .then((response) => response.json())
        .then(data=> this.setState({app_instance_id: data.id, savingIndicator: false}))
    } else {
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
          save: (theExtent) => {
            this.setState({ theExtent: theExtent, savingIndicator: true }, () => {
              this.saveAppInstance()
            })
          }
        }
      },
      {
        label: "Access Configuration",
        title: "Acccess Configuration",
        component: AppAccess,
        ref: 'accessConfigurationStep',
        // hasErrors: false,
        props: {
          loading: this.state.savingIndicator,
          config: this.state.accessConfig,
          profiles: this.state.profiles,
          onComplete: (data) => {
            this.setState({
              accessConfig: data
            })
          }
        }
      },
      {
        label: "Drawer Options",
        component: DrawerOptions,
        props: {
          defaultDrawerOptions: this.state.drawerOptions,
          onComplete: (data) => {
            this.setState({
              drawerOptions: data,
            })
          },
        },
      },
      {
        label: "Map Options",
        component: MapOptions,
        props: {
          defaultMapOptions: this.state.mapOptions,
          onComplete: (data) => {
            this.setState({
              mapOptions: data,
            })
          },
        },
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

global.editAppInstance = editAppInstance;
global.React = React;
global.ReactDOM = ReactDOM;