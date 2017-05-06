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

var getGoogleClusterInlineSvg = function(color) {
  let encoded = window.btoa(
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-100 -100 200 200"><defs><g id="a" transform="rotate(45)"><path d="M0 47A47 47 0 0 0 47 0L62 0A62 62 0 0 1 0 62Z" fill-opacity="0.7"/></g></defs><g fill="' + color + '"><circle r="42"/><use xlink:href="#a"/><g transform="rotate(120)"><use xlink:href="#a"/></g><g transform="rotate(240)"><use xlink:href="#a"/></g></g></svg>');

  return ('data:image/svg+xml;base64,' + encoded);
};

const mapMarkerIcon = `data:image/svg+xml;base64,${window.btoa(
    '<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><g><ellipse ry="5" rx="5" cy="5" cx="5" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#212121"/></g></svg>')}`;

const clusterStyles = [
  {
    width     : 40,
    height    : 40,
    url       : getGoogleClusterInlineSvg('#80D8FF'),
    textColor : "black",
    textSize  : 12,
    fontFamily: `"Lato", "Noto Sans CJK SC", "Noto Sans SC", sans-serif`,
  },
  {
    width     : 60,
    height    : 60,
    url       : getGoogleClusterInlineSvg('#40C4FF'),
    textColor : 'black',
    textSize  : 14,
    fontFamily: `"Lato", "Noto Sans CJK SC", "Noto Sans SC", sans-serif`,
  },
  {
    width     : 80,
    height    : 80,
    url       : getGoogleClusterInlineSvg('#00B0FF'),
    textColor : 'black',
    textSize  : 16,
    fontFamily: `"Lato", "Noto Sans CJK SC", "Noto Sans SC", sans-serif`,
  },
  {
    width     : 100,
    height    : 100,
    url       : getGoogleClusterInlineSvg('#0091EA'),
    textColor : 'black',
    textSize  : 18,
    fontFamily: `"Lato", "Noto Sans CJK SC", "Noto Sans SC", sans-serif`,
  },
  {
    width     : 130,
    height    : 130,
    url       : getGoogleClusterInlineSvg('#01579B'),
    textColor : 'white',
    textSize  : 18,
    fontFamily: `"Lato", "Noto Sans CJK SC", "Noto Sans SC", sans-serif`,
  }
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
                    icon={mapMarkerIcon}
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