import 'ol/ol.css'
import 'Source/css/view.css'
import 'typeface-roboto'
import React, { Component } from 'react'
import Animation from 'Source/helpers/AnimationHelper'
import Swipe from 'Source/components/view/BasicViewer'
import BasicViewerHelper from 'Source/helpers/BasicViewerHelper'
import Collection from 'ol/collection'
import FeaturesHelper from 'Source/helpers/FeaturesHelper'
import GeoCoding from 'Source/services/GeoCodingService'
import GeoJSON from 'ol/format/geojson'
import Group from 'ol/layer/group'
import LayersHelper from 'Source/helpers/LayersHelper'
import MapConfigService from 'Source/services/MapConfigService'
import MapConfigTransformService from 'Source/services/MapConfigTransformService'
import Overlay from 'ol/overlay'
import PropTypes from 'prop-types'
import URLS from 'Source/containers/URLS'
import Vector from 'ol/layer/vector'
import { default as VectorSource } from 'ol/source/vector'
import { arrayMove } from 'react-sortable-hoc'
import proj from 'ol/proj'
import proj4 from 'proj4'
import { render } from 'react-dom'
import { styleFunction } from 'Source/helpers/StyleHelper'
proj.setProj4(proj4)
class BasicViewerContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            mapIsLoading: false,
            drawerOpen: this.props.config.drawerOptions.defaultDrawerOpen,
            featureIdentifyLoading: false,
            activeFeature: 0,
            mouseCoordinates: [0, 0],
            featureIdentifyResult: [],
            showPopup: false,
            identifyEnabled: true,
            legends: [],
            geocodeSearchLoading: false,
            featureCollection: new Collection(),
            map: BasicViewerHelper.getMap(),
            mapLayers: [],
            basemapLayers: []

        }
        this.urls = new URLS(this.props.urls)
    }
    getLegendURL = (layerName) => {
        const { urls } = this.props
        const url = this.urls.getParamterizedURL(urls.wmsURL, {
            'REQUEST': 'GetLegendGraphic',
            'VERSION': '1.0.0',
            'FORMAT': 'image/png',
            "LAYER": layerName
        })
        return this.urls.getProxiedURL(url)
    }
    toggleDrawer = () => {
        const { drawerOpen } = this.state
        this.setState({ drawerOpen: !drawerOpen })
    }
    geocodeSearch = (text, callback) => {
        this.setState({ geocodeSearchLoading: true })
        GeoCoding.search(text, (result) => {
            this.setState({ geocodeSearchLoading: false })
            callback(result)
        })
    }
    addOverlay = (node) => {
        const { activeFeature, featureIdentifyResult, mouseCoordinates } =
            this.state
        let position = mouseCoordinates
        if (featureIdentifyResult.length > 0) {
            const currentFeature = featureIdentifyResult[activeFeature]
            const featureExtent = currentFeature.getGeometry().getExtent()
            position = BasicViewerHelper.getCenterOfExtent(featureExtent)
        }
        this.overlay.setElement(node)
        this.overlay.setPosition(position)
    }
    changeShowPopup = () => {
        const { showPopup } = this.state
        this.setState({ showPopup: !showPopup })
    }
    initSwipe = (layer) => {
        var swipe = document.getElementById('swipe')
        layer.on('precompose', function (event) {
            var ctx = event.context
            var width = ctx.canvas.width * (swipe.value / 100)
            ctx.save()
            ctx.beginPath()
            ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas
                .height)
            ctx.clip()
        })
        layer.on('postcompose', function (event) {
            var ctx = event.context;
            ctx.restore()
        })
        const _map = this.state.map
        swipe.addEventListener('input', function () {
            _map.render()
        }, false)
    }
    getLayerToSwipe = (mapLayers) => {
        if (this.props.config && this.props.config.selectedLayer) {
            let selectedLayerName = this.props.config.selectedLayer.value
            let layerToSwipe = {}
            mapLayers.filter((layer) => {
                if (layer.getProperties()) {
                    if (!layer.get('name').includes(":") && selectedLayerName.includes(":")) {
                        selectedLayerName = selectedLayerName.split(":").pop()
                    }
                    if (layer.get('name') === selectedLayerName) {
                        layerToSwipe = layer
                    }
                }
            })
            return layerToSwipe
        }
    }
    mapInit = () => {
        const { urls } = this.props
        let { map } = this.state
        let that = this
        fetch(urls.mapJsonUrl, {
            method: "GET",
            credentials: 'include'
        }).then((response) => {
            // if (response.status == 403)
            // return Promise.reject('Forbidden')
            return response.json()
        }).then((config) => {
            MapConfigService.load(MapConfigTransformService.transform(
                config), map, urls.proxy)
            this.setBasemapSwitcherLayers()
            this.setLayerSwitcherLayers()
            let mapLayers = this.getLocalLayers(map)
            let layerToSwipe = this.getLayerToSwipe(mapLayers)
            this.initSwipe(layerToSwipe)
            this.createLegends(LayersHelper.getLayers(mapLayers))
        })
    }
    addSelectionLayer = () => {
        let { featureCollection, map } = this.state
        let source = new VectorSource({ features: featureCollection })
        new Vector({
            source: source,
            style: styleFunction,
            title: "Selected Features",
            zIndex: 10000,
            format: new GeoJSON({
                defaultDataProjection: map.getView().getProjection(),
                featureProjection: map.getView().getProjection()
            }),
            map: map
        })
        source.on('addfeature', (e) => {
            Animation.flash(e.feature, map)
        })
    }
    componentWillMount() {
        let { map } = this.state
        this.setState({ mapIsLoading: true })
        this.overlay = new Overlay({
            autoPan: true,
        })
        map.addOverlay(this.overlay)
        this.addSelectionLayer()
        this.mapInit()
    }
    componentDidMount() {
        if (this.props.config.mapOptions.enableIdentify) {
            this.singleClickListner()
        }
    }
    setLayerSwitcherLayers() {
        console.log(this.getLocalLayers(this.state.map))
        this.setState({ mapLayers: this.getLocalLayers(this.state.map) }, this.print)
    }
    getLocalLayers(map) {
        let layers = []
        map.getLayers().getArray().map(layer => {
            if (!(layer instanceof Group) && layer.get('type') !== 'base-group') {
                layers.push(layer)
            } else if (layer instanceof Group && layer.get('type') !== 'base-group') {
                layers.push(...this.getLocalLayers(layer))
            }
        })
        return layers.slice(0).reverse()
    }
    getBaseLayers(map) {
        let layers = []
        map.getLayers().getArray().map(layer => {
            if (layer instanceof Group && layer.get('type') === 'base-group') {
                layer.getLayers().getArray().map(lyr => layers.push(lyr))
            }
        })
        return layers.slice(0).reverse()
    }
    setBasemapSwitcherLayers = (mapLayers) => {
        this.setState({
            basemapLayers: this.getBaseLayers(this.state.map)
        })
    }
    zoomToFeature = (feature) => {
        let { map } = this.state
        this.addStyleToFeature([feature])
        const featureCenter = feature.getGeometry().getExtent()
        const center = BasicViewerHelper.getCenterOfExtent(featureCenter)
        Animation.flyTo(center, map.getView(), 14, () => { })
    }
    zoomToLocation = (pointArray) => {
        let { map } = this.state
        BasicViewerHelper.zoomToLocation(pointArray, map)
    }
    handleLayerVisibilty = name => (event, checked) => {
        let { mapLayers } = this.state
        let layer = mapLayers[name]
        layer.setVisible(checked)
        this.setState({ mapLayers })
    }
    handleBasemapVisibilty = (current) => {
        let { basemapLayers } = this.state
        for (let i = 0; i < basemapLayers.length; i++) {
            if (basemapLayers[i].values_.name === current) {
                basemapLayers[i].setVisible(true)
            }
            else {
                basemapLayers[i].setVisible(false)
            }
        }
    }
    changeLayerOrder = ({ oldIndex, newIndex }) => {
        const { mapLayers } = this.state
        const newMapLayers = arrayMove(mapLayers, oldIndex, newIndex)
        newMapLayers.map((layer, index) => {
            layer.setZIndex(mapLayers.length - index)
        })
        this.setState({ mapLayers: newMapLayers })
    }
    singleClickListner = () => {
        let { map } = this.state
        map.on('singleclick', (e) => {
            if (this.overlay) {
                this.overlay.setElement(undefined)
            }
            this.setState({
                mouseCoordinates: e.coordinate,
                featureIdentifyLoading: true,
                activeFeature: 0,
                featureIdentifyResult: [],
                showPopup: false
            })
            this.featureIdentify(map, e.coordinate)
        })
    }
    createLegends = (layers) => {
        let legends = []
        layers.map(layer => {
            const layerName = layer.getProperties().name
            const layerTitle = layer.getProperties().title
            legends.push({
                layer: layerTitle,
                url: this.getLegendURL(layerName)
            })
        })
        this.setState({ legends })
    }
    resetFeatureCollection = () => {
        let { featureCollection } = this.state
        featureCollection.clear()
    }
    addStyleToFeature = (features) => {
        let { featureCollection } = this.state
        this.resetFeatureCollection()
        if (features && features.length > 0) {
            featureCollection.extend(features)
        }
    }
    featureIdentify = (map, coordinate) => {
        const view = map.getView()
        let identifyPromises = LayersHelper.getLayers(map.getLayers().getArray())
            .map(
                (layer) => FeaturesHelper.readFeaturesThenTransform(
                    this.urls, layer, coordinate, view, map))
        Promise.all(identifyPromises).then(result => {
            const featureIdentifyResult = result.reduce((array1,
                array2) => array1.concat(array2), [])
            this.setState({
                featureIdentifyLoading: false,
                featureIdentifyResult,
                activeFeature: 0,
                showPopup: true
            }, () => this.addStyleToFeature(
                featureIdentifyResult))
        })
    }
    addStyleToCurrentFeature = () => {
        const { activeFeature, featureIdentifyResult } = this.state
        this.addStyleToFeature([featureIdentifyResult[activeFeature]])
    }
    nextFeature = () => {
        const { activeFeature } = this.state
        const nextIndex = activeFeature + 1
        this.setState({ activeFeature: nextIndex }, this.addStyleToCurrentFeature)
    }
    previousFeature = () => {
        const { activeFeature } = this.state
        const previuosIndex = activeFeature - 1
        this.setState({ activeFeature: previuosIndex }, this.addStyleToCurrentFeature)
    }
    exportMap = () => {
        let { map } = this.state
        BasicViewerHelper.exportMap(map)
    }
    render() {
        const { config, urls } = this.props
        let childrenProps = {
            config,
            ...this.state,
            zoomToFeature: this.zoomToFeature,
            addStyleToFeature: this.addStyleToFeature,
            resetFeatureCollection: this.resetFeatureCollection,
            layerName: LayersHelper.layerName,
            layerNameSpace: LayersHelper.layerNameSpace,
            toggleDrawer: this.toggleDrawer,
            urls,
            drawerOptions: this.props.config.drawerOptions,
            addOverlay: this.addOverlay,
            changeShowPopup: this.changeShowPopup,
            nextFeature: this.nextFeature,
            previousFeature: this.previousFeature,
            changeLayerOrder: this.changeLayerOrder,
            handleLayerVisibilty: this.handleLayerVisibilty,
            handleBasemapVisibilty: this.handleBasemapVisibilty,
            zoomToLocation: this.zoomToLocation,
            exportMap: this.exportMap,
            geocodeSearch: this.geocodeSearch
        }
        return <Swipe childrenProps={childrenProps} />
    }
}
BasicViewerContainer.propTypes = {
    urls: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired
}
global.BasicViewerContainer = {
    show: (el, props, urls) => {
        render(<BasicViewerContainer urls={urls} config={props} />,
            document.getElementById(el))
    }
}
