// @flow strict-local

import {
  SortableContainer,
  SortableElement,
  arrayMove
} from 'react-sortable-hoc';
import AutosizeInput from "react-input-autosize";

import NoScrollArea from "./lib/NoScrollArea";
import Toggle from "./lib/Toggle";
import PredictionInputs from "./PredictionInputs";
import Button from "./lib/Button";
import Prompt from "./lib/Prompt";
import Image from "./lib/Image";
import ImagePicker from "./ImagePicker";
import OneDriveManager from "./OneDriveManager";

import R from "./R";
import AnimatedNumber from "./lib/AnimatedNumber";

import * as React from "react";

/**
 * This editor is only appropriate to edit an article, NOT for a bulb
 */

type ExtraAttachmentsAddPropProps = {|
  +onClick: (key: string, value: string) => void,
  +isEditing: boolean,
|};

type ExtraAttachmentsAddPropState = {|
  key: string,
  value: string,
|};

class ExtraAttachmentsAddProp extends React.Component<ExtraAttachmentsAddPropProps, ExtraAttachmentsAddPropState> {

  state: ExtraAttachmentsAddPropState = {
    key  : "",
    value: ""
  };

  _onClick = (): void => {
    this.props.onClick(this.state.key, this.state.value);
  };

  render(): React.Node {
    let {isEditing} = this.props;

    return (
      <div className={`other-prop add ${isEditing ? "" : "hidden"} `}>
        <div className="other-prop-wrapper">
          <AutosizeInput
            type="text"
            className={`new-key normal underlined ${isEditing ? "" : "disabled"}`}
            value={this.state.key}
            onChange={(e) => {
              this.setState({key: e.target.value});
            }}
            disabled={!isEditing}
          />
          <span className="text">:</span>
          <input
            type="text"
            className={`normal underlined ${isEditing ? "" : "disabled"}`}
            value={this.state.value}
            onChange={(e) => {
              this.setState({value: e.target.value});
            }}
            disabled={!isEditing}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                this._onClick();
              }
            }}
          />
          <Button className={isEditing ? "" : "transparent"}
                  onClick={this._onClick}>
            add_circle_outline
          </Button>
        </div>
      </div>
    );
  }
}

type ExtraAttachmentsProps = {|
  +addPanel: (index?: number) => React.Node,
  +isEditing: boolean,
  +others: Array<OtherAttachment>,
  +onChange: (index: number, propKey: string, value: string) => void,
  +removePanel: (index: number, propKey?: string) => React.Node,
|};

type ExtraAttachmentsState = {|
  others: Array<OtherAttachment>,
|};

class ExtraAttachments extends React.Component<ExtraAttachmentsProps, ExtraAttachmentsState> {
  constructor(props: ExtraAttachmentsProps) {
    super(props);
    let {others} = props;

    this.state = {
      others: others
    };
  }

  render(): React.Node {
    const OtherProps = (({props, obj, index, removePanel, addPanel}) =>
        <div className="other-props">
          {props.map((prop) => {
            if (prop !== "type") {
              return (
                <div key={`other-${index}-${prop}`}
                     className="other-prop">
                  <div className="other-prop-wrapper">
                    <span className="text">{prop}:</span>
                    <input
                      type="text"
                      className={`normal underlined ${this.props.isEditing ? "" : "disabled"}`}
                      onBlur={(e) => {
                        this.props.onChange(index,
                          prop,
                          e.target.value);
                      }}
                      disabled={!this.props.isEditing}
                      defaultValue={this.state.others[index][prop] || ""}/>
                    {removePanel(index, prop)}
                  </div>
                </div>
              );
            }

            return "";
          })}
          {addPanel(index)}
        </div>
    );

    return (
      <NoScrollArea padding="10px">
        <div className="others more-info-wrapper">
          {this.state.others.map((other, index) => {
            return (
              <div key={`other-${index}`}
                   className="other-wrapper shadow">
                <div className="other flex-center">
                  <div className="type-wrapper flex-center">
                    <input
                      type="text"
                      className={`type normal ${this.props.isEditing ? "" : "disabled"}`}
                      value={other.type}
                      onChange={(e) => {
                        this.props.onChange(index,
                          "type",
                          e.target.value);
                      }}
                      disabled={!this.props.isEditing}
                    />
                    {this.props.removePanel(index)}
                  </div>

                  <OtherProps props={Object.keys(other)}
                              obj={other}
                              index={index}
                              removePanel={this.props.removePanel}
                              addPanel={this.props.addPanel}
                  /></div>
              </div>
            );
          })}

          <div
            className={` ${this.props.isEditing ? "" : "hidden"} other-wrapper`}>
            <div className="type-wrapper add">
              {this.props.addPanel()}
            </div>
          </div>
        </div>
      </NoScrollArea>
    );
  }
}


/**
 * The specific number is designed such that each toggle just need
 * to flip the last two bits
 * @type {{NOT_SELECTED: number, ADD: number, REMOVE: number,
   *   SELECTED: number}}
 */
const PHOTO_STATUS = {  //      | Originally | Now |
  NOT_SELECTED      : 0b10, //  |   no       | no  |
  ADD__DEPRECATED   : 0b01, //  |   no       | yes | depre.
  REMOVE__DEPRECATED: 0b00, //  |   yes      | no  | depre.
  SELECTED          : 0b01, //  |   yes      | yes |
};

type PhotoStatusType = $Values<typeof PHOTO_STATUS>;

type Photo = {|
  id: string,
  name: string,
  src: string,
  status: PhotoStatusType,
|};

type PhotoPreviewProps = {|
  imageMap: ImageMap,
  isEditing: boolean,
  isSelected: (status: PhotoStatusType) => boolean,
  photos: Array<Photo>,
|}

type PhotoPreviewState = {|
  src: string,
|};

class PhotoPreview extends React.Component<PhotoPreviewProps, PhotoPreviewState> {
  currentImage = "";

  state: PhotoPreviewState = {
    src: "",
  };

  handleMouseOver = (imageName: string): void => {
    this.currentImage = imageName;

    let mapElem = this.props.imageMap[imageName];
    if (mapElem) {
      if (mapElem.url) {
        this.setState({src: mapElem.url});
      } else {
        // Try to get the url
        this.setState({src: mapElem.thumbnail});

        OneDriveManager.updateImageMapElement(mapElem)
          .then(newElem => {
            if (this.currentImage === imageName) {
              // Update the viewer with new image
              let image = new window.Image();
              image.onload = () => {
                if (this.currentImage === imageName) {
                  this.setState({src: mapElem.url});
                }
              };
              image.src = mapElem.url;
            }
          });
      }
    }
  };

  render(): React.Node {
    if (this.props.photos.length === 0) {
      return null;
    }

    let {photos, isSelected, isEditing} = this.props;

    return (
      <div className="photo-preview">
        <div className=" flex column">
          <div
            className="photo-wrapper">
            <Image className="center"
                   contain={true}
                   onClick={true}
                   src={this.state.src} alt=""/>
          </div>
        </div>
        <div className="photo-no-scroll">
          <NoScrollArea padding="10px">
            <div className={`photos ${isEditing ? "show-all" : ""} `}>
              {photos.map(photo =>
                <div key={`photo-preview-${photo.id}`}
                     className={`photo ${isSelected(photo.status) ? "selected" : ""} `}
                     onMouseOver={() => this.handleMouseOver(photo.name)}
                >
                  <img src={photo.src} alt="" height="90px"/>
                </div>
              )}
            </div>
          </NoScrollArea>
        </div>
      </div>
    );
  }
}

const SortableItem = SortableElement(({item, status, i, isSelected, handleClick, loading}) =>
  <div
    className={`photo ${isSelected(status) ? "selected" : ""} ${loading ? "loading" : ""}`}
    onClick={() => {
      handleClick(i);
    }}
  >
    <img src={item.src}
         alt=""
         height="90px"/>
  </div>
);

const SortableList = SortableContainer(
  ({
     items,
     isEditing,
     isSelected,
     handleClick,
     photosInTransfer
   }) =>
    <NoScrollArea padding="10px">
      <div className="more-info-wrapper"
      >
        <div
          className={`photos ${isEditing ? "show-all" : ""}`}>
          {items.map((item, index) =>
            <SortableItem
              key={`photo-${item.id}`}
              status={item.status}
              isSelected={isSelected}
              loading={photosInTransfer.indexOf(item.id) !== -1}
              index={index}
              i={index}
              handleClick={handleClick}
              disabled={!isEditing && photosInTransfer !== 0}
              item={item}
            />
          )}
        </div>
      </div>
    </NoScrollArea>
);

const DISPLAYING = {
  NONE          : -1,
  PHOTOS        : 1,
  MUSICS        : 2,
  MOVIES        : 3,
  LINKS         : 4,
  OTHERS        : 10,
  PHOTOS_PREVIEW: 15,
};

type DisplayingType = $Values<typeof DISPLAYING>;

type Props = ArticleEntry & {|
  +bodyWidth?: number,
  +className?: string,
  +debug?: boolean,
  +hidden: boolean,
  +imageMap: ImageMap,
  +newData?: string, // updating the body of the editor
  +onChange: (entry: ArticleEntry) => Promise<void>,
  +onPromptCancel: () => void,
  +onRefreshQueue: () => Promise<Array<OneDriveImageItem>>,
  +oneDriveManager: OneDriveManager,
  +tagPrediction: Array<string>,
  +version: number,
  +year: number,
|};

type State = {|
  title: string,
  body: string,
  bodyObject: React.Node,
  stats: {|
    timeCreated: number,
    timeBegin: number,
    timeEnd?: number,
  |},
  timeElapsed: number,
  tags: Array<string>,
  isDisplayingMore: DisplayingType,
  photos: Array<Photo>,
  musics: Array<MusicAttachment>,
  movies: Array<MovieAttachment>,
  links: Array<LinkAttachment>,
  others: Array<OtherAttachment>,
  isEditing: boolean,
  isEditingLoading: boolean,
  isFullscreen: boolean,
  hasPrompt: boolean,

  isLoadingImages: boolean,
  photosInTransfer: Array<string>,

  isSaving: boolean,

  bodyWidth: number,
  isDarkMode: boolean,
|};

class Editor extends React.Component<Props, State> {
  // Go back three hours for midnight sesh
  DEFAULT_TITLE: string = this.convertToDateTime(new Date() - 3 * 60 * 60 * 1000)
    .substr(0, 7);

  DEFAULT_STATE: $Shape<State> = {
    title           : this.DEFAULT_TITLE,
    body            : "",
    bodyObject      : "",
    stats           : {
      timeCreated: 0,
      timeBegin  : 0,
      timeEnd    : 0,
    },
    timeElapsed     : 0,
    tags            : [],
    isDisplayingMore: -1,
    photos          : [],
    musics          : [],
    movies          : [],
    links           : [],
    others          : [],
    isEditing       : false,
    isEditingLoading: false,
    isFullscreen    : false,
    hasPrompt       : false,

    isLoadingImages : false,
    photosInTransfer: [],

    isSaving: false,

    isDarkMode: false,
  };

  version: number = 0;
  hasUnsavedChanges: boolean = false;
  previousBody: string = "";

  _timeElapsedUpdateInterval: ?IntervalID = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      ...this.DEFAULT_STATE,
      bodyWidth: this.props.bodyWidth != null ? this.props.bodyWidth : 80,
    };

    this.version = new Date().getTime();

    if (this.props.debug === true) {
      this.state = {
        ...this.DEFAULT_STATE,
        title           : "This is title 题目",
        body            : "This is body 正文 This is body 正文 This is body 正文 This is body 正文 This is body 正文 This is body 正文 This is body 正文",
        stats           : {
          timeCreated: 0,
          timeBegin  : 0,
          timeEnd    : 0,
        },
        timeElapsed     : 0,
        tags            : ["tag1", "tag2", "tag3"],
        isDisplayingMore: DISPLAYING.NONE,
        photos          : [{
          id    : "1",
          src   : "http://placehold.it/120x150",
          status: PHOTO_STATUS.ADD__DEPRECATED,
          name  : "",
        }, {
          id    : "2",
          src   : "http://placehold.it/150x150",
          status: PHOTO_STATUS.NOT_SELECTED,
          name  : "",
        }, {
          id    : "3",
          src   : "http://placehold.it/130x150",
          status: PHOTO_STATUS.SELECTED,
          name  : "",
        }, {
          id    : "4",
          src   : "http://placehold.it/150x120",
          status: PHOTO_STATUS.REMOVE__DEPRECATED,
          name  : "",
        }, {
          id    : "5",
          src   : "http://placehold.it/130x150",
          status: PHOTO_STATUS.ADD__DEPRECATED,
          name  : "",
        }, {
          id    : "6",
          src   : "http://placehold.it/150x150",
          status: PHOTO_STATUS.NOT_SELECTED,
          name  : "",
        }, {
          id    : "7",
          src   : "http://placehold.it/150x150",
          status: PHOTO_STATUS.SELECTED,
          name  : "",
        }, {
          id    : "8",
          src   : "http://placehold.it/120x150",
          status: PHOTO_STATUS.REMOVE__DEPRECATED,
          name  : "",
        }
          // , {
          //   id    : 11,
          //   src   : "http://placehold.it/320x150",
          //   status: PHOTO_STATUS.ADD__DEPRECATED,
          // }, {
          //   id    : 21,
          //   src   : "http://placehold.it/350x150",
          //   status: PHOTO_STATUS.NOT_SELECTED,
          // }, {
          //   id    : 31,
          //   src   : "http://placehold.it/330x150",
          //   status: PHOTO_STATUS.SELECTED,
          // }, {
          //   id    : 41,
          //   src   : "http://placehold.it/350x120",
          //   status: PHOTO_STATUS.REMOVE__DEPRECATED,
          // }, {
          //   id    : 51,
          //   src   : "http://placehold.it/30x150",
          //   status: PHOTO_STATUS.ADD__DEPRECATED,
          // }, {
          //   id    : 61,
          //   src   : "http://placehold.it/150x150",
          //   status: PHOTO_STATUS.NOT_SELECTED,
          // }, {
          //   id    : 71,
          //   src   : "http://placehold.it/350x150",
          //   status: PHOTO_STATUS.SELECTED,
          // }, {
          //   id    : 81,
          //   src   : "http://placehold.it/350x150",
          //   status: PHOTO_STATUS.REMOVE__DEPRECATED,
          // }, {
          //   id    : 12,
          //   src   : "http://placehold.it/320x150",
          //   status: PHOTO_STATUS.ADD__DEPRECATED,
          // }, {
          //   id    : 22,
          //   src   : "http://placehold.it/350x150",
          //   status: PHOTO_STATUS.NOT_SELECTED,
          // }, {
          //   id    : 32,
          //   src   : "http://placehold.it/330x150",
          //   status: PHOTO_STATUS.SELECTED,
          // }, {
          //   id    : 42,
          //   src   : "http://placehold.it/350x120",
          //   status: PHOTO_STATUS.REMOVE__DEPRECATED,
          // }, {
          //   id    : 52,
          //   src   : "http://placehold.it/2048x1980",
          //   status: PHOTO_STATUS.ADD__DEPRECATED,
          // }, {
          //   id    : 62,
          //   src   : "http://placehold.it/1500x3500",
          //   status: PHOTO_STATUS.NOT_SELECTED,
          // }, {
          //   id    : 72,
          //   src   : "http://placehold.it/3500x1500",
          //   status: PHOTO_STATUS.SELECTED,
          // }, {
          //   id    : 82,
          //   src   : "http://placehold.it/3500x2350",
          //   status: PHOTO_STATUS.REMOVE__DEPRECATED,
          // }
        ],
        musics          : [{
          title: "Never Gonna Give You Up",
          by   : "Rick Astley"
        }],
        movies          : [{
          title: "Rose and Jack"
        }],
        links           : [{
          url  : "anoxic.me",
          title: "I'm awesome!"
        }],
        others          : [{
          type  : "book",
          author: "My Ass",
          title : "A Random Book",
        }, {
          type  : "audio",
          url   : "http://anoxic.me",
          title : "My personal site",
          extra1: "lol",
          extra2: "lol",
          extra3: "lol",
          extra4: "lol",
        }, {
          type : "video",
          url  : "https://google.com",
          title: "This is actually a Google website"
        }],
        isEditing       : false,
        isEditingLoading: false,
        isFullscreen    : false,
        isDarkMode      : false,
      };
    }

    this._timeElapsedUpdateInterval = setInterval(() => {
      // On purpose: to avoid laggy update
      // eslint-disable-next-line
      this.state.timeElapsed = this.state.isEditing ? (this.state.timeElapsed + 1) : 0;
    }, 1000);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return !nextProps.hidden;
  }

  componentWillUnmount(): void {
    if (this._timeElapsedUpdateInterval) {
      clearInterval(this._timeElapsedUpdateInterval);
    }
  }

  componentWillUpdate(nextProps: Props, nextState: State): void {
    if (nextProps.version > this.version) {
      if (this.hasUnsavedChanges) {
        nextState.hasPrompt = true;
      } else {
        // Override current data with new data
        if (typeof nextProps.newData !== "undefined") {
          // This is to create a new entry
          // $FlowFixMe this works for componentWillUpdate
          nextState = Object.assign(nextState,
            this.DEFAULT_STATE,
            {
              isEditing: true,
              stats    : {
                timeCreated: new Date().getTime(),
                timeBegin  : new Date().getTime(),
              },
              body     : nextProps.newData || "",
            })
          ;
          this.hasUnsavedChanges = true;
        } else {
          nextState.title = R.highlightArrayToString(nextProps.title);
          nextState.bodyObject = R.highlightArrayToJSX(nextProps.body);
          nextState.body = R.highlightArrayToString(nextProps.body);

          nextState.stats = {
            timeCreated: nextProps.time.created,
            timeBegin  : nextProps.time.begin || nextProps.time.created,
            timeEnd    : nextProps.time.end,
          };

          if (nextProps.tags) {
            nextState.tags = [...nextProps.tags];
          }

          nextState.photos = [];

          if (nextProps[R.PROP_PHOTO]) {
            nextState.photos = this.convertPhotoNames([...nextProps[R.PROP_PHOTO]],
              PHOTO_STATUS.SELECTED);
          }

          nextState.musics = [...(nextProps[R.PROP_MUSIC] || [])];
          nextState.movies = [...(nextProps[R.PROP_MOVIE] || [])];
          nextState.links = [...(nextProps[R.PROP_LINK] || [])];
          nextState.others = [...(nextProps[R.PROP_OTHER] || [])];

          nextState.isEditing = false;
          nextState.isDisplayingMore = -1;
        }
        this.version = new Date().getTime();
      }
    } else {
      // We're modifying current changes
      nextState.bodyObject = nextState.body;
    }
  }

  /**
   * Converts a list of photo names from OneDrive or from
   * OneDriveManager to something this class can understand
   * @param photoNames
   * @param status - the status of these photos
   */
  convertPhotoNames(photoNames: Array<string>,
                    status: PhotoStatusType): Array<Photo> {
    let result = [];

    for (let photo of photoNames) {
      result.push({
        id    : this.props.imageMap[photo].id,
        name  : photo,
        src   : this.props.imageMap[photo].thumbnail,
        status: status,
      });
    }

    return result;
  }

  /**
   * Extracts the data that should be uploaded to the server
   * This function assumes that no images are still being transferred
   */
  extractUploadableData = (): ArticleEntry => {
    let data: ArticleEntry = {
      type : R.TYPE_ARTICLE,
      time : {
        created: this.state.stats.timeCreated,
        begin  : this.state.stats.timeBegin || this.state.stats.timeCreated,
        end    : this.state.stats.timeEnd == null ? new Date().getTime() : this.state.stats.timeEnd,
      },
      title: this.state.title,
      body : this.state.body,
    };

    if (this.state.photos) {
      let images = [];
      for (let image of this.state.photos) {
        if (image.status === PHOTO_STATUS.SELECTED) {
          images.push(image.name);
        }
      }

      if (images.length) {
        data.images = images;
      }
    }

    let tags = this.state.tags;
    if (tags && tags.length) {
      data.tags = tags;
    }

    const STATE_LIST = ["musics", "movies", "links", "others"],
      MAPPED_LIST = [R.PROP_MUSIC, R.PROP_MOVIE, R.PROP_LINK, R.PROP_OTHER];

    for (let i = 0; i < STATE_LIST.length; ++i) {
      let stateList = STATE_LIST[i],
        mappedList = MAPPED_LIST[i];
      if (this.state[stateList] && this.state[stateList].length) {
        data[mappedList] = this.state[stateList];
      }
    }

    return data;
  };

  showPhotoPreview = (): void => {
    this.setState({
      isDisplayingMore: DISPLAYING.PHOTOS_PREVIEW,
    });
  };

  /**
   * Toggles the photo preview - whether the user is presented with a
   * larger preview of the photo
   */
  togglePhotoPreview = (): void => {
    let state = this.state.isDisplayingMore === DISPLAYING.PHOTOS_PREVIEW ?
      DISPLAYING.PHOTOS :
      DISPLAYING.PHOTOS_PREVIEW;

    this.setState({
      isDisplayingMore: state,
    });
  };

  toggleFullscreen = (): void => {
    const state = this.state.isFullscreen;

    this.setState({
      isFullscreen: !state,
      isDarkMode  : false,
    });
  };

  toggleDarkMode = (): void => {
    const state = this.state.isDarkMode;

    this.setState({
      isDarkMode: !state,
    });
  };

  /**
   * Toggles the photo status - whether it's going to be added or
   * removed
   */
  togglePhotoStatus = (i: number): void => {
    if (!this.state.isEditing) {
      return;
    }

    let id = this.state.photos[i].id,
      name = this.state.photos[i].name;

    name = this.generateNewImageName(name, i);

    this.addToPhotosInTransfer(id);

    (this.state.photos[i].status === PHOTO_STATUS.NOT_SELECTED ?
        this.props.oneDriveManager
          .addImageById(id, this.props.year, name) :
        this.props.oneDriveManager
          .removeImageById(id)
    )
      .then(() => {
        let photos = this.state.photos;
        photos[i].status = ~photos[i].status & 0b11;
        photos[i].name = name;
        this.setState({
          photos: photos
        });

        this.removeFromPhotosInTransfer(id);
      }, err => {
        this.removeFromPhotosInTransfer(id);
      });
  };

  toggleEditMode = (): void => {
    if (!this.state.isEditing) {
      // It's going to get modified
      this.hasUnsavedChanges = true;
      this.setState({
        isEditing: true,
      });
      return;
    }

    // Trying to save this entry
    this.setState({
      isEditingLoading: true,
    });
    let extracted = this.extractUploadableData();

    this.props.onChange(extracted)
      .then(() => {
        this.hasUnsavedChanges = false;

        this.setState({
          isEditing       : false,
          isEditingLoading: false,
        });
      }, () => {
        this.setState({
          isEditingLoading: false,
        });
      });
  };

  saveEdit = (): void => {
    this.setState({
      isSaving: true,
    });

    const extracted = this.extractUploadableData();

    this.props.onChange(extracted)
      .then(() => {
        this.hasUnsavedChanges = false;

        this.setState({
          isSaving: false,
        });
      }, () => {
        this.setState({
          isSaving: false,
        });
      });
  };

  generateRemovePanelFor(tag: string, handleClick?: () => void): React.Node {
    let onClick = handleClick;
    if (typeof onClick !== "function") {
      onClick = () => {
        let state = {};
        state[tag] = [];

        // eslint-disable-next-line
        this.state.isDisplayingMore = DISPLAYING.NONE;
        this.setState(state);
      };
    }

    return (
      <Button className={this.state.isEditing ? "" : "transparent"}
              onClick={onClick}>remove_circle_outline
      </Button>
    );
  }

  /**
   * Generates the remove panel for others. Used to pass in to
   * generate in
   * `ExtraAttachments`
   * @param otherIndex - the index of the attachment to be removed
   * @param propKey - (Optional) the key to be removed
   * @returns {*}
   */
  generateRemovePanelForOthers = (otherIndex: number,
                                  propKey?: string): React.Node => {
    if (propKey !== undefined) {
      // Remove a specific property
      let handleClick = () => {
        let others = this.state.others;
        delete others[otherIndex][propKey];

        this.setState({others: others});
      };

      return (
        <Button className={this.state.isEditing ? "" : "transparent"}
                onClick={handleClick}>remove_circle_outline
        </Button>
      );
    } else {
      // Remove the entire entry
      let handleClick = () => {
        let others = this.state.others;
        others.splice(otherIndex, 1);

        if (others.length === 0) {
          // eslint-disable-next-line
          this.state.isDisplayingMore = DISPLAYING.NONE;
        }
        this.setState({others: others});
      };

      return (
        <Button className={this.state.isEditing ? "" : "hidden"}
                onClick={handleClick}>remove_circle
        </Button>
      );
    }
  };

  /**
   * Generates an icon to add a property or a new "other" attachment
   * @param otherIndex - the index of the attachment
   */
  generateAddPanelForOthers = (otherIndex?: number): React.Node => {
    if (otherIndex === undefined) {
      // Generate a new entry
      let handleClick = () => {
        // Just generate a new one
        let others = this.state.others;
        others.push({type: ""});
        this.setState({
          others: others
        });
      };

      return (
        <Button
          className={this.state.isEditing ? "" : "transparent"}
          onClick={handleClick}>
          add_circle
        </Button>
      );
    } else {
      // Generate a new property
      let handleClick = (propKey, value) => {
        let others = this.state.others;
        others[otherIndex][propKey] = value;

        this.setState({
          others: others
        });
      };

      return (
        <ExtraAttachmentsAddProp
          onClick={handleClick}
          isEditing={this.state.isEditing}
        />
      );
    }
  };

  generateMoreInfo(): React.Node {
    switch (this.state.isDisplayingMore) {
      case DISPLAYING.PHOTOS:
        if (this.state.photos.length === 0) {
          return (
            <div className="empty">
              <p className="flex-center">Looks like this entry doesn't
                have any photos for now</p>
            </div>

          )
        }

        return (
          <SortableList items={this.state.photos}
                        isEditing={this.state.isEditing}
                        isSelected={
                          status => status === PHOTO_STATUS.SELECTED}
                        photosInTransfer={this.state.photosInTransfer}
                        distance={5}
                        handleClick={(i) => {
                          this.togglePhotoStatus(i)
                        }}
                        axis="xy"
                        onSortEnd={this.onPhotoSortEnd}/>
        );

      case DISPLAYING.PHOTOS_PREVIEW:
        return (
          <PhotoPreview
            photos={this.state.photos}
            imageMap={this.props.imageMap}
            isSelected={
              status => status === PHOTO_STATUS.SELECTED}
            isEditing={this.state.isEditing}
          ></PhotoPreview>
        );

      case DISPLAYING.MUSICS:
        if (this.state.musics.length === 0) {
          // eslint-disable-next-line
          this.state.musics = [{title: "", by: ""}];
        }
        return (
          <div className="music more-info-wrapper">
            <AutosizeInput
              className={`title normal underlined ${this.state.isEditing ? "" : "disabled"}`}
              onChange={this.onMusicTitleChange}
              disabled={!this.state.isEditing}
              value={this.state.musics[0].title || ""}/>
            <span className="text">By</span>
            <AutosizeInput
              type="text"
              className={`by normal underlined ${this.state.isEditing ? "" : "disabled"}`}
              onChange={this.onMusicByChange}
              disabled={!this.state.isEditing}
              value={this.state.musics[0].by || ""}/>
            {this.generateRemovePanelFor("musics")}
          </div>
        );

      case DISPLAYING.MOVIES:
        if (this.state.movies.length === 0) {
          // eslint-disable-next-line
          this.state.movies = [{title: ""}];
        }
        return (
          <div className="movie more-info-wrapper">
            <AutosizeInput
              className={`title normal underlined ${this.state.isEditing ? "" : "disabled"}`}
              onChange={this.onMovieTitleChange}
              disabled={!this.state.isEditing}
              value={this.state.movies[0].title || ""}
            />
            {this.generateRemovePanelFor("movies")}
          </div>
        );

      case DISPLAYING.LINKS:
        if (this.state.links.length === 0) {
          // eslint-disable-next-line
          this.state.links = [{title: "", url: ""}];
        }
        return (
          <div className="link more-info-wrapper">
            <AutosizeInput
              className={`title normal underlined ${this.state.isEditing ? "" : "disabled"}`}
              onChange={this.onLinkTitleChange}
              disabled={!this.state.isEditing}
              value={this.state.links[0].title || ""}/>
            <span className="text"> - ://</span>
            <AutosizeInput
              type="text"
              className={`url normal underlined ${this.state.isEditing ? "" : "disabled"}`}
              onChange={this.onLinkUrlChange}
              disabled={!this.state.isEditing}
              value={this.state.links[0].url || ""}/>
            {this.generateRemovePanelFor("links")}
          </div>
        );

      case DISPLAYING.OTHERS:
        if (this.state.links.length === 0) {

        }

        return (
          <ExtraAttachments others={this.state.others}
                            isEditing={this.state.isEditing}
                            onChange={this.setOthersProperty}
                            removePanel={this.generateRemovePanelForOthers}
                            addPanel={this.generateAddPanelForOthers}
          ></ExtraAttachments>
        );
      default:
        // Not doing anything else since nothing is to be shown
        return null;
    }
  }

  setIsDisplaying = (isDisplaying: DisplayingType): void => {
    if (this.state.isDisplayingMore === isDisplaying) {
      this.setState({
        isDisplayingMore: DISPLAYING.NONE
      });
    } else {
      this.setState({
        isDisplayingMore: isDisplaying
      });
    }
  };

  setOthersProperty = (index: number, prop: string, value: string): void => {
    const {others} = this.state;
    others[index][prop] = value;

    this.setState({
      others: others
    });
  };

  restorePreviousBody = (): void => {
    const currentBody = this.state.body;
    this.setState({
      body: localStorage.getItem('previousBody') || "",
    });
    localStorage.setItem('previousBody', currentBody);
  };

  // region Listeners (on...Change)

  onDecreasingTextBodyWidth = (): void => {
    this.setState({
      bodyWidth: Math.max(this.state.bodyWidth - 5, 10)
    });
  };

  onIncreasingTextBodyWidth = (): void => {
    this.setState({
      bodyWidth: Math.min(this.state.bodyWidth + 5, 100)
    });
  };

  onTitleChange = (event: SyntheticInputEvent<>): void => {
    this.setState({
      title: event.target.value
    });
  };

  onBodyChange = (event: SyntheticInputEvent<>): void => {
    this.setState({
      body: event.target.value
    });
  };

  onBodyKeyDown = (e: SyntheticKeyboardEvent<>): void => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) {
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();

      const start = t.selectionStart,
        end = t.selectionEnd;

      // Set textarea value to text before caret + tab + text after
      // caret
      t.value = t.value.substring(0,
          start) + "\t" + t.value.substring(end);

      // Put caret at right position again
      t.selectionStart = (t.selectionEnd) = start + 1;
    } else if (e.key === "Enter") {

      // Process the body
      const lines = t.value.split(/\r*\n/),
        {stats} = this.state;

      // Store this body
      localStorage.setItem('previousBody', t.value);

      let selectionStart = t.selectionStart;

      const tags = [["Begin @ ", "timeBegin"],
        ["End @ ", "timeEnd"],
        ["Created @ ", "timeCreated"]];

      for (let i = 0; i < lines.length; ++i) {
        let line = lines[i],
          spliced = false;

        for (let pair of tags) {
          if (line.startsWith(pair[0])) {
            let time = this.convertFromDateTime(line.substring(pair[0].length));
            if (time && new Date(time).getFullYear() === this.props.year) {
              stats[pair[1]] = time;

              lines.splice(i, 1);

              spliced = true;
              break;
            }
          }
        }

        if (!spliced) {
          // Add space
          lines[i] = this.addSpaceBetweenCharacters(line);
        }
        // Add the difference
        selectionStart += lines[i].length - line.length;
        // Because we just introduced a new character
        if (spliced) {
          --selectionStart;
          --i;
        }
      }


      this.setState({
        stats: stats,
        body : lines.join("\r\n"),
      }, () => {
        t.selectionStart = (t.selectionEnd = selectionStart);
      });
    } else {

      // Scroll to the bottom if applicable
      if (t.selectionEnd === t.value.length) {
        t.scrollTop = t.scrollHeight;
      }
    }
  };

  onPhotoSortEnd = (obj: {
    oldIndex: number,
    newIndex: number
  }): void => {
    this.setState({
      photos: arrayMove([...this.state.photos],
        obj.oldIndex,
        obj.newIndex),
    });
  };

  onMusicTitleChange = (e: SyntheticInputEvent<>): void => {
    const music = this.state.musics[0];
    music.title = e.target.value;
    this.setState({
      musics: [music]
    });
  };

  onMusicByChange = (e: SyntheticInputEvent<>): void => {
    const music = this.state.musics[0];
    music.by = e.target.value;
    this.setState({
      musics: [music]
    });
  };

  onMovieTitleChange = (e: SyntheticInputEvent<>): void => {
    const movie = this.state.movies[0];
    movie.title = e.target.value;
    this.setState({
      movies: [movie]
    });
  };

  onLinkTitleChange = (e: SyntheticInputEvent<>): void => {
    const link = this.state.links[0];
    link.title = e.target.value;
    this.setState({
      links: [link]
    });
  };

  onLinkUrlChange = (e: SyntheticInputEvent<>): void => {
    const link = this.state.links[0];
    link.url = e.target.value;
    this.setState({
      links: [link]
    });
  };

  onPromptYes = (): void => {
    this.hasUnsavedChanges = false;
    this.setState({hasPrompt: false});
  };

  onPromptNo = (): void => {
    // So that the editor won't take a look at that new thing
    this.version = this.props.version;
    this.setState({hasPrompt: false});
  };

  onPromptCancel = (): void => {
    this.props.onPromptCancel();
    this.setState({hasPrompt: false});
  };

  refreshPhoto = (): Promise<void> => {
    this.setState({
      isLoadingImages: true,
    });

    return this.props.onRefreshQueue()
      .then(list => list ? list.map(photo => photo.name) : undefined)
      .then(names => {
        if (typeof names === "undefined") {
          this.setState({
            isLoadingImages: false,
          });
          return;
        }

        // Combining current photo list with new ones
        let currentNames = this.state.photos.map(photo => photo.name),
          newNames = [];

        for (let name of names) {
          if (currentNames.indexOf(name) === -1) {
            newNames.push(name);
          }
        }

        this.setState({
          isLoadingImages: false,
          photos         : [...this.state.photos, ...this.convertPhotoNames(
            newNames,
            PHOTO_STATUS.NOT_SELECTED)]
        });
      });
  };

  addAllPhotos = (): void => {
    for (let i = 0; i < this.state.photos.length; ++i) {
      if (this.state.photos[i].status !== PHOTO_STATUS.SELECTED) {
        this.togglePhotoStatus(i);
      }
    }
  };

  addToPhotosInTransfer = (id: string): void => {
    if (this.state.photosInTransfer.indexOf(id) === -1) {
      this.setState({
        photosInTransfer: [...this.state.photosInTransfer, id],
      });
    }
  };

  removeFromPhotosInTransfer = (id: string): void => {
    let index = this.state.photosInTransfer.indexOf(id);

    if (index !== -1) {
      this.state.photosInTransfer.splice(index, 1);
      this.forceUpdate();
    }
  };

  // endregion listeners

  // region Utility functions

  /**
   * Adds a space between English and Chinese, for example, 一a一 will
   * become 一 a 一
   * @param str
   */
  addSpaceBetweenCharacters(str: string): string {
    return str.replace(/([\u00ff-\uffff])([A-Za-z0-9])/g, "$1 $2")
      .replace(/([A-Za-z0-9])([\u00ff-\uffff])/g, "$1 $2");
  }

  convertToDateTime(seconds: ?number): string {
    if (seconds == null) {
      return "N/A";
    }

    const c = (i) => {
      return ("0" + i % 60).slice(-2);
    };

    let date = new Date(seconds);

    return c(date.getMonth() + 1) + c(date.getDate()) + (date.getFullYear() % 100) + " "
      + c(date.getHours()) + c(date.getMinutes());
  }

  convertFromDateTime(time: string): number {
    var month = parseInt(time.substring(0, 2), 10),
      day = parseInt(time.substring(2, 4), 10),
      year = parseInt(time.substring(4, 6), 10),
      hour = 0,
      minute = 0;
    if (time.length > 6) {
      hour = parseInt(time.substring(7, 9), 10);
      minute = parseInt(time.substring(9, 11), 10);
    }

    var date = new Date(2000 + year, month - 1, day, hour, minute);
    return date.getTime();
  }

  convertToElapsed(seconds: number): string {
    return `${parseInt(seconds / 60, 10)}:${("0" + seconds % 60).slice(
      -2)}`;
  }

  generateNewImageName(name: string, i: number): string {
    let suffix = name.lastIndexOf(".");
    suffix = name.substr(suffix);

    return `${new Date().getTime()}_${i}${suffix}`;
  }

  // endregion

  render(): React.Node {
    return (
      <div
        className={`Editor ${this.state.isDarkMode ? "dark" : ""} ${this.state.isFullscreen ? "fullscreen" : ""}`}>
        <Prompt className={`${this.state.hasPrompt ? "" : "hidden"}`}
                title="Content Conflict"
                message="There appears to be unsaved changes here. If you proceed, they will be lost and overwritten by the new contents. Do you wish to continue?"
                yes="discard"
                onYes={this.onPromptYes}
                no="edit draft"
                onNo={this.onPromptNo}
                cancel="keep & return"
                onCancel={this.onPromptCancel}
        />
        <nav className="nav has-hint">
          <Button
            tooltip="Restore draft"
            className={(this.state.isEditing && localStorage.getItem(
              'previousBody')) ? "" : "hidden"}
            onClick={this.restorePreviousBody}>restore</Button>
          <Button
            tooltip="Toggle dark mode"
            className={`${this.state.isFullscreen ? "" : "hidden"}`}
            onClick={this.toggleDarkMode}>highlight</Button>
          <Button tooltip="Narrower editor"
                  onClick={this.onDecreasingTextBodyWidth}>format_indent_increase</Button>
          <Button tooltip="Wider editor"
                  onClick={this.onIncreasingTextBodyWidth}>format_indent_decrease</Button>
          <Toggle
            className="btn fullscreen"
            isChanging={this.state.isFullscreen}
            onClick={this.toggleFullscreen}
            firstIcon="fullscreen"
            secondIcon="fullscreen_exit"
            tooltip="Fullscreen"
          />
          <Button className="hint">more_vert</Button>
        </nav>

        <header>
          <input
            type="text"
            className={`title normal underlined ${this.state.isFullscreen ? "hidden" : ""}`}
            value={this.state.title}
            onChange={this.onTitleChange}
            disabled={!this.state.isEditing}
          />
          <div className="stats">
            <div className="stat primary">
              <AnimatedNumber value={R.count(this.state.body)}/>
            </div>
            <div className="stat times">
              <i className="material-icons">insert_drive_file</i>
              <div>
                {this.convertToDateTime(this.state.stats.timeCreated)}
              </div>
            </div>
            <div className="stat times">
              <i className="material-icons">play_arrow</i>
              <div>
                {this.convertToDateTime(this.state.stats.timeBegin)}
              </div>
            </div>
            <div className="stat times">
              <i className="material-icons">stop</i>
              <div>
                {this.convertToDateTime(this.state.stats.timeEnd)}
              </div>
            </div>
            <div className="stat">
              <i className="material-icons">timer</i>
              <div>
                {this.convertToElapsed(this.state.timeElapsed)}
              </div>
            </div>
          </div>
        </header>

        <div
          className={`text-body-wrapper ${this.state.isDisplayingMore === DISPLAYING.PHOTOS_PREVIEW ? "transparent" : ""}`}>
          <div className="text-body-wrapper-2"
               style={{
                 padding: `0 ${50 - this.state.bodyWidth / 2}%`,
                 width  : `${this.state.bodyWidth}%`
               }}
          >
            <NoScrollArea
              backgroundColor={`${this.state.isDarkMode ? "#212121" : "white"}`}>
              {this.state.isEditing ?
                <textarea className="text-body"
                          value={this.state.body}
                          onChange={this.onBodyChange}
                          onKeyDown={this.onBodyKeyDown}/>
                :
                <pre
                  className="text-body">{this.state.bodyObject}</pre>
              }
              {/*<textarea className="text-body"*/}
              {/*value={this.state.body}*/}
              {/*onChange={this.onBodyChange}*/}
              {/*onKeyDown={this.onBodyKeyDown}*/}
              {/*disabled={!this.state.isEditing}/>*/}
            </NoScrollArea>
          </div>
        </div>
        <div
          className={`shadow up ${this.state.isFullscreen ? "hidden" : ""}`}></div>
        <div
          className={`extras ${this.state.isFullscreen ? "hidden" : ""} `}>
          <div className="buttons">
            <Button className="tags">label_outline</Button>
            <div className="current-tags-wrapper">
              <PredictionInputs
                className={`tag white-background new-tag-wrapper ${!this.state.isEditing ? "hidden" : ""}`}
                tagPrediction={this.props.tagPrediction}
                tags={this.state.tags}
                onChange={tags => this.setState({tags: tags})}
                disabled={!this.state.isEditing}
              />
            </div>
            <div className="flex-last-item"></div>
            <span
              className={`${this.state.isDisplayingMore !== DISPLAYING.PHOTOS && this.state.isDisplayingMore !== DISPLAYING.PHOTOS_PREVIEW ? "hidden" : ""} btn-breaker`}></span>
            <Toggle
              className="btn"
              isHidden={(this.state.isDisplayingMore !== DISPLAYING.PHOTOS && this.state.isDisplayingMore !== DISPLAYING.PHOTOS_PREVIEW) || !this.state.photos.length}
              isChanging={this.state.isDisplayingMore === DISPLAYING.PHOTOS_PREVIEW}
              onClick={this.togglePhotoPreview}
              firstIcon="zoom_in"
              secondIcon="zoom_out"
              tooltip="Preview images"
            ></Toggle>
            <Button
              className={(this.state.isDisplayingMore !== DISPLAYING.PHOTOS && this.state.isDisplayingMore !== DISPLAYING.PHOTOS_PREVIEW) || !this.state.isEditing ? "hidden" : ""}
              onClick={this.refreshPhoto}
              loading={this.state.isLoadingImages}
              tooltip="Refresh available images"
            >refresh</Button>
            <Button
              className={this.state.isDisplayingMore === DISPLAYING.PHOTOS && this.state.photos.length && this.state.isEditing ? "" : "hidden"}
              onClick={this.addAllPhotos}
              loading={this.state.photosInTransfer.length}
              tooltip="Add all"
            >library_add</Button>
            <ImagePicker
              className={this.state.isDisplayingMore === DISPLAYING.PHOTOS && this.state.isEditing ? "" : "hidden"}
              onFinish={this.refreshPhoto} multiple
            />
            <span
              className={`${this.state.isDisplayingMore !== DISPLAYING.PHOTOS && this.state.isDisplayingMore !== DISPLAYING.PHOTOS_PREVIEW ? "hidden" : ""} btn-breaker`}></span>
            {[["photos", "photo_library"],
              ["musics", "library_music"],
              ["movies", "movie"],
              ["links", "link"],
              ["others", "more_horiz"]].map(
              tag => {
                return (
                  <Toggle
                    key={tag[0]}
                    className={`${tag[0]} btn ${this.props.className || ""} ${this.state[tag[0]].length ? "underlined" : ""} ${this.state.isDisplayingMore === DISPLAYING[tag[0].toUpperCase()] ? "active" : ""}  `}
                    onClick={() => {
                      this.setIsDisplaying(DISPLAYING[tag[0].toUpperCase()])
                    }}
                    firstIcon={tag[1]}
                    secondIcon="add_circle_outline"
                    isChangingOnHover={true}
                    isChanging={!this.state[tag[0]].length}
                    disabled={this.state[tag[0]].length === 0 && !this.state.isEditing}
                  />
                );
              })}
            <span className="btn-breaker"></span>
            <Button
              className={`${this.state.isEditing ? "" : "hidden"}`}
              loading={this.state.isSaving}
              tooltip="Save"
              onClick={this.saveEdit}>save</Button>
            <Toggle
              className="btn send-edit accent"
              loading={this.state.isEditingLoading}
              isChanging={!this.state.isEditing}
              firstIcon="send"
              secondIcon="mode_edit"
              tooltip="Save and quit editing"
              onClick={this.toggleEditMode}
            />
          </div>
          <div
            className={`more-info ${this.state.isDisplayingMore === DISPLAYING.NONE ? "hidden" : ""}`}>
            {this.generateMoreInfo()}
          </div>
        </div>
      </div>
    );
  }
}

export default Editor;
