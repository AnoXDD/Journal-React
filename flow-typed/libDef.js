// region OneDrive

declare type OneDriveItem = {
  +"@microsoft.graph.downloadUrl": string,
  +content: string,
  +id: string,
  +name: string,
};
declare type OneDriveImageItem = OneDriveItem & {
  +thumbnails: string,
};
declare type OneDriveRawBulbItem = {|
  content: string,
  +id?: string,
  imageId?: string,
  merged?: boolean,
  +name: string,
  links?: Array<LinkAttachment>,
  place?: PlaceAttachment,
  time: BulbEntryTime,
|};
// The item to be uploaded
declare type OneDriveQueuedItem = {|
  name: string,
  content: ArrayBuffer,
  contentType: string,
|};

// endregion

// region Map

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

// endregion

declare type SearchCriteria = {|
  attachments: Array<string>,
  clear: boolean,
  hasArticle: boolean,
  hasBulb: boolean,
  keywords: Array<string>,
  months: Array<string>,
  simple: false,
  tags: Array<string>,
|} | {|
  clear: boolean,
  keywords: Array<string>,
  simple: true,
|};

declare type ImageData = {|
  id: string,
  thumbnail: string, // url
  url?: string, // url
|}
declare type ImageMap = {|
  [fileName: string]: ImageData
|} | {};

declare type LinkAttachment = {|
  title?: string,
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
declare type PlaceAttachment = {|
  ...GeoCoordinate,
  +title?: string,
|};

declare type Data = Array<ArticleEntry | BulbEntry>;
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
  links?: Array<LinkAttachment>,
  place?: PlaceAttachment,
  time: BulbEntryTime,
  type: "bulb",
|};
declare type ContentStyle = {|
  [createdTime: string]: number, // scrollTop, how many px from the top of
  // scroll area
  height: number,
|};

declare type Style = {
  [string]: mixed
};

declare type SettingsType = {|
  bulbAttachLocation: boolean,
  bulbMapCenter: GeoCoordinate,
  password?: string,
|};

declare type GoogleMapRef = any;