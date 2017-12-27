import React from 'react';
import PropTypes from 'prop-types';

import ReactPaginate from 'react-paginate'
import Switch from 'react-toggle-switch'
import 'react-toggle-switch/dist/css/switch.min.css'

export default class ResourceSelector extends React.Component {
  state = {
    myResources: true,
    searchValue: "",
    
    selectedResource: this.props.selectedResource,

    showPagination: true,
    forcePage: 0,

    limit: 50,
    offset: 0,
  }

  setMyResources(myResources) {
    this.setState({
      myResources: myResources,
      loading: true
    },
      () => {
        this.loadInitialState();
      })
  }
  
  getResources(fetchUrl) {
    let url = this.state.myResources ?
      fetchUrl+ `&limit=${this.state.limit}&offset=${this.state.offset}` +`&owner=${username}` :
      fetchUrl+ `&limit=${this.state.limit}&offset=${this.state.offset}`
    
    fetch(url, { credentials: 'include' })
      .then((response) => response.json())
      .then(data => {
        this.setState({
          resources: data.objects,
          resourcesCount: data.meta.total_count,
          loading: false
        })
      })
  }

  searchResources(resourceTitle) {
    if (resourceTitle === '') {
      this.loadInitialState()
      return 0
    }

    let url = this.state.myResources ?
      this.props.searchResourcesApiUrl+`${resourceTitle}`+`&owner=${username}` :
      this.props.searchResourcesApiUrl+`${resourceTitle}`
    
    this.setState({ loading: true }, () => {
      fetch(url, { credentials: 'include' })
      .then((response) => response.json())
      .then(data => {
        this.setState({
          resources: data.objects,
          loading: false,
          showPagination: false
        })
      })
    })
  }

  loadInitialState() {
    this.setState({
      loading: true,

      showPagination: true,
      forcePage: 0,

      searchValue: '',
      selectedResource: this.props.selectedResource,

      limit: 50,
      offset: 0,
    }, () => {
      this.getResources(this.props.resourcesApiUrl)
    })
  }

  componentWillMount() {
    this.loadInitialState()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props != nextProps) {
      this.setState({selectedResource: nextProps.selectedResource})
    }
  }

  componentWillUnmount() {
    this.props.onComplete(this.state.selectedResource)
  }

  onPageChange(data) {
    this.setState(
      {
        forcePage: data.selected,
        offset: data.selected * this.state.limit
      },
      () => {
        this.getResources(this.props.resourcesApiUrl)
      }
    )
  }

  onNext() {
    this.props.stepForward()
  }

  onPrev() {
    this.props.stepBack()
  }

  handleSelection(resource) {
    this.props.onComplete(resource)
  }

  renderHeader() {
    return (
      <div className="row">
        <div className="col-xs-5 col-md-4">
          <h4>{this.props.title}</h4>
        </div>
      </div>
    )
  }

  renderSwitchSearch() {
    return (
      <div className="row">
        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4 flex-element">
          <span className="switcher-label">{'Shared Layers'}</span>
          <Switch on={this.state.myResources} onClick={()=> this.setMyResources(!this.state.myResources)} />
            <span className="switcher-label">{'My Layers'}</span>
        </div>
        <div className="col-xs-12 col-sm-6 col-md-8 col-lg-8">
          <div className="input-group">
              <span className="input-group-addon" id="search-box"><i className="fa fa-search" aria-hidden="true"></i></span>
            <input
              onChange={(e) => {
                this.setState(
                  { searchValue: e.target.value },
                  () => {
                    this.searchResources(this.state.searchValue)
                  }
                )
              }}
              value={this.state.searchValue}
              type="text" className="form-control" placeholder="Search By Title" aria-describedby="search-box" />
          </div>
        </div>
      </div>
    )
  }

  renderLoading() {
    return (
      <div className="loading"></div>
    )
  }
  
  renderResources() {
    return (
      <ul className="list-group">
        {this.state.resources.map((resource, i) => { return (
          <li
            key={i}  
            className="list-group-item"
            onClick={() => { this.handleSelection(resource) }}
            style={
              this.state.selectedResource && this.state.selectedResource.typename === resource.typename ?
                {
                  boxShadow: "0px 0px 10px 5px steelblue",
                  paddingTop: "0px",
                  paddingBottom: '0px',
                  cursor: "pointer",
                  marginBottom: '25px'
                } :
                {
                  paddingTop: "0px",
                  paddingBottom: '0px',
                  cursor: "pointer",
                  marginBottom: '25px'
                }
            }>
            
          <div className="row">
            <div className="col-xs-12 col-md-3" style={{ height: "180px", padding: "0px" }}>
              <img
                className="img-responsive"
                src={resource.thumbnail_url}
                style={{ width: "100%", height: "inherit", margin: 'auto' }}
              />
            </div>
            <div className="col-xs-12 col-md-9">
              <div className="content">
                <h4 className="list-group-item-heading" style={{ marginTop: "1%" }}>{resource.title}</h4>
                <hr></hr>
                <p className="mb-1">{`${resource.abstract.substring(0, 140)} ...`}</p>
                <p>{`Owner: ${resource.owner.username}`}</p>
                <a type="button" href={`/layers/${resource.typename}`} target="_blank" className="btn btn-primary pull-right" style={{ margin:
                  "5px", float: "right" }}>
                  Resource Details
                </a>
              </div>
            </div>
          </div>
        </li>
        ) })}
      </ul>
    )
  }

  renderTip1() {
    return (
      <div className="panel panel-danger" style={{
        margin: "15px auto 15px auto"
      }}>
        <div className="panel-heading">No Layers</div>
        <div className="panel-body">
          <p>You have not created any layers! Please create or upload layers</p>
          <a className='btn btn-primary pull-right' target="_blank" href='/layers/upload'>Upload a layer</a>

        </div>
      </div>
    )
  }
  
  renderTip2() {
    return (
      <div className="panel panel-danger" style={{
        margin: "15px auto 15px auto"
      }}>
        <div className="panel-heading">No Layers</div>
        <div className="panel-body">
          <p>You don't have layers shared with you! Please create or upload layers</p>
          <a className='btn btn-primary pull-right' target="_blank" href='/layers/upload'>Upload a layer</a>

        </div>
      </div>
    )
  }

  renderPagination() {
    return (

      <ReactPaginate
        previousLabel={"Previous"}
        forcePage = {this.state.forcePage}
        nextLabel={"Next"}
        breakLabel={< a href="javascript:;" > ...</a>}
        breakClassName={"break-me"}
        /* total resources / limit */  
        pageCount={this.state.resourcesCount / this.state.limit}
        marginPagesDisplayed={3}
        pageRangeDisplayed={2}
        onPageChange={(data)=>this.onPageChange(data)}
        containerClassName={"pagination center-pagination"}
        subContainerClassName={"pages pagination"}
        activeClassName={"active"} />

    )
  }

  render() {
    return (
      <div>
        {this.renderHeader()}
        <hr />
        {this.renderSwitchSearch()}
        <br />
        {
          this.state.loading ?
            this.renderLoading() :
            this.state.resources &&
              this.state.resources.length > 0 ?
              this.renderResources() :
              this.state.myResources ?
                this.renderTip1() :
                this.renderTip2()  
        }
        <br />
        {
          this.state.showPagination &&
          Math.ceil(this.state.resourcesCount / this.state.limit) > 1 &&
          this.renderPagination()
        }
      </div>
    )
  }
 }