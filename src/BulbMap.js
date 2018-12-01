// @flow strict-local

/**
 * Created by Anoxic on 050417.
 * A map to represent bulbs
 */

import {
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps";
import MarkerClusterer from 'react-google-maps/lib/addons/MarkerClusterer';

import * as React from "react";


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
    width     : 120,
    height    : 120,
    url       : getGoogleClusterInlineSvg('#0091EA'),
    textColor : 'black',
    textSize  : 18,
    fontFamily: `"Lato", "Noto Sans CJK SC", "Noto Sans SC", sans-serif`,
  },
  {
    width     : 180,
    height    : 180,
    url       : getGoogleClusterInlineSvg('#01579B'),
    textColor : 'white',
    textSize  : 20,
    fontFamily: `"Lato", "Noto Sans CJK SC", "Noto Sans SC", sans-serif`,
  }
];

const BulbGoogleMap = withGoogleMap(props => (
  <GoogleMap
    ref={props.onMapLoad}
    defaultZoom={3}
    defaultCenter={{lat: 32.8689785, lng: -117.2382162}}
    onBoundsChanged={props.onBoundChange}
  >
    <MarkerClusterer
      averageCenter={ true }
      enableRetinaIcons={ true }
      styles={clusterStyles}
      gridSize={ 60 }>
      {props.bulbList.map((bulb, index) => {
        if (bulb.place) {
          return (
            <Marker
              key={bulb.time.created}
              position={{
                lat: parseFloat(bulb.place.latitude),
                lng: parseFloat(bulb.place.longitude)
              }}
              icon={mapMarkerIcon}
              onClick={() => props.onBulbClick(props.contentStyle[bulb.time.created],
                index)}
            />
          );
        } else {
          return null;
        }
      })}
    </MarkerClusterer>
  </GoogleMap>
));

/**
 * Set the size of the bound that map will expand to four directions when the
 * user clicks on a bulb with location
 * @type {number}
 */
const PAN_BOUND_SIZE = .005;
/**
 * To avoid continuously calling the change function, only call it after
 * this amount of time. The unit is MILISECONDS
 * @type {number}
 */
const BOUND_CHANGE_COOLDOWN = 500;


type Props = {|
  +center: GeoCoordinate,
  +contentStyle: ContentType,
  +data: Data,
  +hidden: boolean,
  +onBoundChange: (bound: MapBound) => void,
  +onBulbClick: (top: number, index: number) => void,
  +version: number,
|}

export default class BulbMap extends React.Component<Props> {

  _map: ?GoogleMapRef = null;
  _version: number = 0;

  _lastTimeout: ?TimeoutID = null;

  shouldComponentUpdate(nextProps: Props): boolean {
    return !nextProps.hidden;
  }

  componentWillUpdate(nextProps: Props): void {
    if (nextProps.version > this._version && nextProps.center) {
      let {latitude, longitude} = nextProps.center,
        center = {
          lat: latitude,
          lng: longitude,
        },
        bound = {
          west : longitude - PAN_BOUND_SIZE,
          east : longitude + PAN_BOUND_SIZE,
          south: latitude + PAN_BOUND_SIZE,
          north: latitude - PAN_BOUND_SIZE,
        };

      // Flow is stupid that I can't put them in a single if block
      this._map && this._map.panTo(center);
      this._map && this._map.fitBounds(bound);

      this._version = nextProps.version;
    }
  }

  handleBoundChange = (): void => {
    if (this._lastTimeout != null) {
      clearTimeout(this._lastTimeout);
    }
    this._lastTimeout = setTimeout(this.notifyHandleChange,
      BOUND_CHANGE_COOLDOWN);
  };

  notifyHandleChange = (): void => {
    if (this._map == null) {
      return;
    }

    const bound = this._map.getBounds();

    // todo for some reason this part is obfuscated
    this.props.onBoundChange({
      south: bound.l.j,
      north: bound.l.l,
      west : bound.j.j,
      east : bound.j.l,
    });
  };

  handleMapLoad = (map: GoogleMapRef): void => {
    this._map = map;
  };

  render(): React.Node {
    return (
      <div className="BulbMap" style={{height: `100%`}}>
        <BulbGoogleMap
          containerElement={
            <div style={{height: `100%`}}/>
          }
          mapElement={
            <div style={{height: `100%`}}/>
          }
          onMapLoad={this.handleMapLoad}
          bulbList={this.props.data}
          contentStyle={this.props.contentStyle}
          onBulbClick={this.props.onBulbClick}
          onBoundChange={this.handleBoundChange}
        />
      </div>
    );
  }
}