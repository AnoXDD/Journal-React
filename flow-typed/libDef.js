declare type OneDriveItem = {
  +"@microsoft.graph.downloadUrl": string,
  +id: string,
  +name: string,
};
declare type OneDriveImageItem = OneDriveItem & {
  +thumbnails: string,
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

declare type BulbList = any;
declare type Data = any;
declare type EntryTime = {|
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
  time: EntryTime,
  title: string,
  type: "article",
|};
declare type ContentStyle = {|
  +[createdTime: string]: number, // scrollTop, how many px from the top of
                                  // scroll area
|};

declare type GoogleMapRef = any;