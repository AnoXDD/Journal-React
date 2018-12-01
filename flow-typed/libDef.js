declare type OnedriveResponse = {
  +"@microsoft.graph.downloadUrl": string,
  +id: string,
  +name: string,
};

declare type GeoCoordinate = {|
  latitude: number,
  longitude: number
|};

declare type MapBound = {|
  east: number,
  north: number,
  south: number,
  west: number
|}


declare type Data = any;
declare type ContentType = any;

declare type GoogleMapRef = any;