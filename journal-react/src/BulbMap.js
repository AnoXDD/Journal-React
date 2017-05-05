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


/*
 * This is the modify version of:
 * https://developers.google.com/maps/documentation/javascript/examples/event-arguments
 *
 * Add <script src="https://maps.googleapis.com/maps/api/js"></script> to your HTML to provide google.maps reference
 */
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
          gridSize={ 60 }>
        {props.bulbList.map(bulb => {
          if (bulb.place) {
            return (
                <Marker
                    key={bulb.time.created}
                    position={{lat:parseInt(bulb.place.latitude,10),lng:parseInt(bulb.place.longitude,10)}}
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