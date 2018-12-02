declare type OneDriveItem = {
  +"@microsoft.graph.downloadUrl": string,
  +id: string,
  +name: string,
};
declare type OneDriveImageItem = OneDriveItem & {
  +thumbnails: string,
};
// The item to be uploaded
declare type OneDriveQueuedItem = {|
  name: string,
  content: ArrayBuffer,
  contentType: string,
|};

declare type GeoCoordinate = {|
  latitude: number,
  longitude: number
|};

declare type MapBound = {|
  east: number,
  north: number,
  south: number,
  west: number
|};

declare type ImageData = {|
  id: string,
  thumbnail: string, // url
  url: string, // url
|}
declare type ImageMap = {|
  [fileName: string]: ImageData
|};

declare type LinkAttachment = {|
  title: string,
  url: string,
|}
declare type MovieAttachment = {|
  title: string,
|};
declare type MusicAttachment = {|
  title: string,
  by: string,
|};
declare type OtherAttachment = {
  [key: string]: string,
};

declare type Data = any;
declare type ArticleEntryTime = {|
  created: number,
  begin: number,
  end: number,
|};
declare type ArticleEntry = {|
  body: string,
  images?: Array<string>, // array of filenames
  links?: Array<LinkAttachment>,
  movie?: Array<MovieAttachment>,
  music?: Array<MusicAttachment>,
  others?: Array<OtherAttachment>,
  tags?: Array<string>,
  time: ArticleEntryTime,
  title: string,
  type: "article",
|};

declare type BulbEntryTime = {|
  created: number,
|}
declare type BulbEntry = {|
  body: string,
  images?: Array<string>, // array of filenames
  place: GeoCoordinate,
  time: BulbEntryTime,
  type: "bulb",
|};
declare type ContentStyle = {|
  +[createdTime: string]: number, // scrollTop, how many px from the top of
                                  // scroll area
  +height: number,
|};

declare type Style = {
  [string]: mixed
};

declare type GoogleMapRef = any;