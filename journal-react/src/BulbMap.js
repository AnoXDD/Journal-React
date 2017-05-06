/**
 * Created by Anoxic on 050417.
 * A map to represent bulbs
 */

import React, {Component} from "react";

import {
    withGoogleMap,
    GoogleMap,
    Marker,
} from "react-google-maps";
import MarkerClusterer from 'react-google-maps/lib/addons/MarkerClusterer';

import cluster0 from "./imgs/map-cluster-0.svg";
import cluster1 from "./imgs/map-cluster-1.svg";
import cluster2 from "./imgs/map-cluster-2.svg";
import cluster3 from "./imgs/map-cluster-3.svg";
import cluster4 from "./imgs/map-cluster-4.svg";
import cluster5 from "./imgs/map-cluster-5.svg";
import cluster6 from "./imgs/map-cluster-6.svg";
import cluster7 from "./imgs/map-cluster-7.svg";
import cluster8 from "./imgs/map-cluster-8.svg";



const clusterSize = 25;
const clusterStyles = [
  {
    textColor: 'black',
    url      : {cluster0}.cluster0,
    height   : clusterSize,
    width    : clusterSize
  }, {
    textColor: 'black',
    url      : {cluster1}.cluster1,
    height   : clusterSize,
    width    : clusterSize
  }, {
    textColor: 'black',
    url      : {cluster2}.cluster2,
    height   : clusterSize,
    width    : clusterSize
  }, {
    textColor: 'black',
    url      : {cluster3}.cluster3,
    height   : clusterSize,
    width    : clusterSize
  }, {
    textColor: 'black',
    url      : {cluster4}.cluster4,
    height   : clusterSize,
    width    : clusterSize
  }, {
    textColor: 'white',
    url      : {cluster5}.cluster5,
    height   : clusterSize,
    width    : clusterSize
  }, {
    textColor: 'white',
    url      : {cluster6}.cluster6,
    height   : clusterSize,
    width    : clusterSize
  }, {
    textColor: 'white',
    url      : {cluster7}.cluster7,
    height   : clusterSize,
    width    : clusterSize
  }, {
    textColor: 'white',
    url      : {cluster8}.cluster8,
    height   : clusterSize,
    width    : clusterSize
  },

];

const BulbGoogleMap = withGoogleMap(props => (
    <GoogleMap
        ref={props.onMapLoad}
        defaultZoom={3}
        defaultCenter={{ lat: -25.363882, lng: 131.044922 }}
        onClick={props.onMapClick}
    >
      <MarkerClusterer
          averageCenter={ true }
          enableRetinaIcons={ true }
          styles={clusterStyles}
          gridSize={ 60 }>
        {props.bulbList.map(bulb => {
          if (bulb.place) {
            return (
                <Marker
                    key={bulb.time.created}
                    position={{lat:parseFloat(bulb.place.latitude,10),lng:parseFloat(bulb.place.longitude,10)}}
                />
            );
          } else {
            return null;
          }
        })}
      </MarkerClusterer>
    </GoogleMap>
));

export default class BulbMap extends Component {

  handleMapLoad = this.handleMapLoad.bind(this);
  handleMapClick = this.handleMapClick.bind(this);
  handleMarkerRightClick = this.handleMarkerRightClick.bind(this);

  handleMapLoad(map) {
    this._mapComponent = map;
    if (map) {
      console.log(map.getZoom());
    }
  }

  /*
   * This is called when you click on the map.
   * Go and try click now.
   */
  handleMapClick(event) {
    const nextMarkers = [
      ...this.state.markers,
      {
        position        : event.latLng,
        defaultAnimation: 2,
        key             : Date.now(), // Add a key property for:
                                      // http://fb.me/react-warning-keys
      },
    ];
    this.setState({
      markers: nextMarkers,
    });
  }

  handleMarkerRightClick(targetMarker) {
    /*
     * All you modify is data, and the view is driven by data.
     * This is so called data-driven-development. (And yes, it's now in
     * web front end and even with google maps API.)
     */
    const nextMarkers = this.state.markers.filter(
        marker => marker !== targetMarker);
    this.setState({
      markers: nextMarkers,
    });
  }

  render() {
    console.log({cluster1});

    return (
        <div className="BulbMap" style={{height: `100%`}}>
          <BulbGoogleMap
              containerElement={
            <div style={{ height: `100%` }} />
          }
              mapElement={
            <div style={{ height: `100%` }} />
          }
              onMapLoad={this.handleMapLoad}
              onMapClick={this.handleMapClick}
              bulbList={this.props.data}
              onMarkerRightClick={this.handleMarkerRightClick}
          />
        </div>
    );
  }
}