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


declare type BulbList = any;
declare type Data = any;
declare type ContentStyle = {|
  +[createdTime: string]: number, // scrollTop, how many px from the top of
                                  // scroll area
|};

declare type GoogleMapRef = any;