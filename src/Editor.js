import React, {Component} from 'react';

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

/**
 * This editor is only appropriate to edit an article, NOT for a bulb
 */

class ExtraAttachmentsAddProp extends Component {

  state = {
    key  : "",
    value: ""
  };

  render() {
    let {onClick, isEditing} = this.props;
    const onClickAdd = () => {
      onClick(this.state.key, this.state.value);
    };

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
                    onClickAdd();
                  }
                }}
            />
            <Button className={isEditing ? "" : "transparent"}
                    onClick={onClickAdd}>
              add_circle_outline
            </Button>
          </div>
        </div>
    );
  }
}

class ExtraAttachments extends Component {
  constructor(props) {
    super(props);
    let {others} = props;

    this.state = {
      others: others
    };
  }

  render() {
    const OtherProps = (({props, obj, index, removePanel, addPanel}) =>
            <div className="other-props">
              { props.map((prop) => {
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
                          { removePanel(index, prop) }
                        </div>
                      </div>
                  );
                }

                return "";
              })}
              { addPanel(index) }
            </div>
    );

    return (
        <NoScrollArea padding="10px">
          <div className="others more-info-wrapper">
            { this.state.others.map((other, index) => {
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
                        { this.props.removePanel(index) }
                      </div>

                      <OtherProps props={Object.keys(other)}
                                  obj={other}
                                  index={index}
                                  removePanel={this.props.removePanel}
                                  addPanel={this.props.addPanel}
                      /></div>
                  </div>
              );
            }) }

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

class PhotoPreview extends Component {

  currentImage = "";

  state = {
    src: "",
  };

  constructor(props) {
    super(props);

    this.handleMouseOver = this.handleMouseOver.bind(this);
  }

  handleMouseOver(imageName) {
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
  }

  render() {
    if (this.props.photos.length === 0) {
      return;
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

const SortableList = SortableContainer(({items, isEditing, isSelected, handleClick, photosInTransfer}) => {
  return (
      <NoScrollArea padding="10px">
        <div className="more-info-wrapper">
          <div
              className={`photos ${isEditing ? "show-all" : ""}`}>
            {items.map((item, index) => {

              return (
                  <SortableItem key={`photo-${item.id}`}
                                status={item.status}
                                isSelected={isSelected}
                                loading={photosInTransfer.indexOf(item.id) !== -1}
                                index={index}
                                i={index}
                                handleClick={handleClick}
                                disabled={!isEditing && photosInTransfer !== 0}
                                item={item}/>
              );
            })}
          </div>
        </div>
      </NoScrollArea>
  );
});

class Editor extends Component {
  DISPLAYING = {
    NONE          : -1,
    PHOTOS        : 1,
    MUSICS        : 2,
    MOVIES        : 3,
    LINKS         : 4,
    OTHERS        : 10,
    PHOTOS_PREVIEW: 15,
  };

  /**
   * The specific number is designed such that each toggle just need to flip
   * the last two bits
   * @type {{NOT_SELECTED: number, ADD: number, REMOVE: number, SELECTED:
     *     number}}
   */
  PHOTO_STATUS = {  //      | Originally | Now |
    NOT_SELECTED: 0b10, //  |   no       | no  |
    // ADD         : 0b01, //  |   no       | yes | depre.
    // REMOVE      : 0b00, //  |   yes      | no  | depre.
    SELECTED    : 0b01, //  |   yes      | yes |
  };

  DEFAULT_TITLE = this.convertToDateTime(new Date()).substr(0, 7);

  DEFAULT_STATE = {
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
    isFullscreen    : false,
    hasPrompt       : false,

    isLoadingImages : false,
    photosInTransfer: [],

    isSaving: false,
  }

  version = 0;
  hasUnsavedChanges = false;
  previousBody = "";

  constructor(props) {
    super(props);

    this.state = Object.assign({bodyWidth: this.props.bodyWidth || 80},
        this.DEFAULT_STATE);

    this.version = new Date().getTime();

    if (this.props.debug) {
      this.state = {
        title           : "This is title 题目",
        body            : "This is body 正文 This is body 正文 This is body 正文 This is body 正文 This is body 正文 This is body 正文 This is body 正文",
        stats           : {
          timeCreated: 0,
          timeBegin  : 0,
          timeEnd    : 0,
        },
        timeElapsed     : 0,
        tags            : ["tag1", "tag2", "tag3"],
        isDisplayingMore: this.DISPLAYING.NONE,
        photos          : [{
          id    : 1,
          src   : "http://placehold.it/120x150",
          status: this.PHOTO_STATUS.ADD,
        }, {
          id    : 2,
          src   : "http://placehold.it/150x150",
          status: this.PHOTO_STATUS.NOT_SELECTED,
        }, {
          id    : 3,
          src   : "http://placehold.it/130x150",
          status: this.PHOTO_STATUS.SELECTED,
        }, {
          id    : 4,
          src   : "http://placehold.it/150x120",
          status: this.PHOTO_STATUS.REMOVE,
        }, {
          id    : 5,
          src   : "http://placehold.it/130x150",
          status: this.PHOTO_STATUS.ADD,
        }, {
          id    : 6,
          src   : "http://placehold.it/150x150",
          status: this.PHOTO_STATUS.NOT_SELECTED,
        }, {
          id    : 7,
          src   : "http://placehold.it/150x150",
          status: this.PHOTO_STATUS.SELECTED,
        }, {
          id    : 8,
          src   : "http://placehold.it/120x150",
          status: this.PHOTO_STATUS.REMOVE,
        }
          // , {
          //   id    : 11,
          //   src   : "http://placehold.it/320x150",
          //   status: this.PHOTO_STATUS.ADD,
          // }, {
          //   id    : 21,
          //   src   : "http://placehold.it/350x150",
          //   status: this.PHOTO_STATUS.NOT_SELECTED,
          // }, {
          //   id    : 31,
          //   src   : "http://placehold.it/330x150",
          //   status: this.PHOTO_STATUS.SELECTED,
          // }, {
          //   id    : 41,
          //   src   : "http://placehold.it/350x120",
          //   status: this.PHOTO_STATUS.REMOVE,
          // }, {
          //   id    : 51,
          //   src   : "http://placehold.it/30x150",
          //   status: this.PHOTO_STATUS.ADD,
          // }, {
          //   id    : 61,
          //   src   : "http://placehold.it/150x150",
          //   status: this.PHOTO_STATUS.NOT_SELECTED,
          // }, {
          //   id    : 71,
          //   src   : "http://placehold.it/350x150",
          //   status: this.PHOTO_STATUS.SELECTED,
          // }, {
          //   id    : 81,
          //   src   : "http://placehold.it/350x150",
          //   status: this.PHOTO_STATUS.REMOVE,
          // }, {
          //   id    : 12,
          //   src   : "http://placehold.it/320x150",
          //   status: this.PHOTO_STATUS.ADD,
          // }, {
          //   id    : 22,
          //   src   : "http://placehold.it/350x150",
          //   status: this.PHOTO_STATUS.NOT_SELECTED,
          // }, {
          //   id    : 32,
          //   src   : "http://placehold.it/330x150",
          //   status: this.PHOTO_STATUS.SELECTED,
          // }, {
          //   id    : 42,
          //   src   : "http://placehold.it/350x120",
          //   status: this.PHOTO_STATUS.REMOVE,
          // }, {
          //   id    : 52,
          //   src   : "http://placehold.it/2048x1980",
          //   status: this.PHOTO_STATUS.ADD,
          // }, {
          //   id    : 62,
          //   src   : "http://placehold.it/1500x3500",
          //   status: this.PHOTO_STATUS.NOT_SELECTED,
          // }, {
          //   id    : 72,
          //   src   : "http://placehold.it/3500x1500",
          //   status: this.PHOTO_STATUS.SELECTED,
          // }, {
          //   id    : 82,
          //   src   : "http://placehold.it/3500x2350",
          //   status: this.PHOTO_STATUS.REMOVE,
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

    setInterval(() => {
      // On purpose: to avoid laggy update
      // eslint-disable-next-line
      this.state.timeElapsed = this.state.isEditing ? (this.state.timeElapsed + 1) : 0;
    }, 1000);

    this.setIsDisplaying = this.setIsDisplaying.bind(this);
    this.setOthersProperty = this.setOthersProperty.bind(this);
    this.generateMoreInfo = this.generateMoreInfo.bind(this);
    this.generateAddPanelFor = this.generateAddPanelFor.bind(this);
    this.generateAddPanelForOthers = this.generateAddPanelForOthers.bind(this);
    this.generateRemovePanelFor = this.generateRemovePanelFor.bind(this);
    this.generateRemovePanelForOthers = this.generateRemovePanelForOthers.bind(
        this);
    this.onIncreasingTextBodyWidth = this.onIncreasingTextBodyWidth.bind(this);
    this.onDecreasingTextBodyWidth = this.onDecreasingTextBodyWidth.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);
    this.onBodyChange = this.onBodyChange.bind(this);
    this.onBodyKeyDown = this.onBodyKeyDown.bind(this);
    this.onPhotoSortEnd = this.onPhotoSortEnd.bind(this);
    this.onMusicByChange = this.onMusicByChange.bind(this);
    this.onMusicTitleChange = this.onMusicTitleChange.bind(this);
    this.onMovieTitleChange = this.onMovieTitleChange.bind(this);
    this.onLinkTitleChange = this.onLinkTitleChange.bind(this);
    this.onLinkUrlChange = this.onLinkUrlChange.bind(this);
    this.onPromptYes = this.onPromptYes.bind(this);
    this.onPromptNo = this.onPromptNo.bind(this);
    this.onPromptCancel = this.onPromptCancel.bind(this);
    this.toggleEditMode = this.toggleEditMode.bind(this);
    this.togglePhotoPreview = this.togglePhotoPreview.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    this.toggleDarkMode = this.toggleDarkMode.bind(this);
    this.refreshPhoto = this.refreshPhoto.bind(this);
    this.addAllPhotos = this.addAllPhotos.bind(this);
    this.extractUploadableData = this.extractUploadableData.bind(this);
    this.restorePreviousBody = this.restorePreviousBody.bind(this);
    this.addToPhotosInTransfer = this.addToPhotosInTransfer.bind(this);
    this.removeFromPhotosInTransfer = this.removeFromPhotosInTransfer.bind(this);
    this.saveEdit = this.saveEdit.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return !nextProps.hidden;
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.version > this.version) {
      if (this.hasUnsavedChanges) {
        nextState.hasPrompt = true;
      } else {
        // Override current data with new data
        if (typeof nextProps.newData !== "undefined") {
          // This is to create a new entry
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
                this.PHOTO_STATUS.SELECTED);
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
   * Converts a list of photo names from OneDrive or from OneDriveManager to
   * something this class can understand
   * @param photoNames
   * @param status - the status of these photos
   */
  convertPhotoNames(photoNames, status) {
    let result = [];

    for (let photo of photoNames) {
      result.push({
        name  : photo,
        id    : this.props.imageMap[photo].id,
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
  extractUploadableData() {
    let data = {
      type : R.TYPE_ARTICLE,
      time : {
        created: this.state.stats.timeCreated,
        begin  : this.state.stats.timeBegin || this.state.stats.timeCreated,
        end    : this.state.stats.timeEnd || new Date().getTime(),
      },
      title: this.state.title,
      body : this.state.body,
    };

    if (this.state.photos) {
      let images = [];
      for (let image of this.state.photos) {
        if (image.status === this.PHOTO_STATUS.SELECTED) {
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
  }

  /**
   * Toggles the photo preview - whether the user is presented with a larger
   * preview of the photo
   */
  togglePhotoPreview() {
    let state = this.state.isDisplayingMore === this.DISPLAYING.PHOTOS_PREVIEW ?
        this.DISPLAYING.PHOTOS :
        this.DISPLAYING.PHOTOS_PREVIEW;

    this.setState({
      isDisplayingMore: state,
    });
  }

  toggleFullscreen() {
    let state = this.state.isFullscreen;

    this.setState({
      isFullscreen: !state,
      isDarkMode  : false,
    });
  }

  toggleDarkMode() {
    let state = this.state.isDarkMode;

    this.setState({
      isDarkMode: !state,
    });
  }

  /**
   * Toggles the photo status - whether it's going to be added or removed
   */
  togglePhotoStatus(i) {
    if (!this.state.isEditing) {
      return false;
    }

    let id = this.state.photos[i].id,
        name = this.state.photos[i].name;

    name = this.generateNewImageName(name, i);

    this.addToPhotosInTransfer(id);

    (this.state.photos[i].status === this.PHOTO_STATUS.NOT_SELECTED ?
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
  }

  toggleEditMode() {
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
    })
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
  }

  saveEdit() {
    this.setState({
      isSaving: true,
    });

    let extracted = this.extractUploadableData();

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
  }

  generateAddPanelFor(tag, state) {
    return (
        <div className="more-info-wrapper">
          <Button className="icon-wrapper"
                  onClick={() => {
                    this.setState(state);
                  }}>
            add_circle_outline
          </Button>
        </div>
    )
  }

  generateRemovePanelFor(tag, handleClick) {
    if (typeof handleClick !== "function") {
      handleClick = () => {
        let state = {};
        state[tag] = [];

        // eslint-disable-next-line
        this.state.isDisplayingMore = this.DISPLAYING.NONE;
        this.setState(state);
      };
    }

    return (
        <Button className={this.state.isEditing ? "" : "transparent"}
                onClick={handleClick}>remove_circle_outline
        </Button>
    );
  }

  /**
   * Generates the remove panel for others. Used to pass in to generate in
   * `ExtraAttachments`
   * @param otherIndex - the index of the attachment to be removed
   * @param propKey - (Optional) the key to be removed
   * @returns {*}
   */
  generateRemovePanelForOthers(otherIndex, propKey) {
    if (typeof propKey !== "undefined") {
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
          this.state.isDisplayingMore = this.DISPLAYING.NONE;
        }
        this.setState({others: others});
      };

      return (
          <Button className={this.state.isEditing ? "" : "hidden"}
                  onClick={handleClick}>remove_circle
          </Button>
      );
    }

  }

  /**
   * Generates an icon to add a property or a new "other" attachment
   * @param otherIndex - the index of the attachment
   * @param propKey - the name of the key to be added
   */
  generateAddPanelForOthers(otherIndex, propKey) {
    if (typeof otherIndex === "undefined") {
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
  }

  generateMoreInfo() {
    switch (this.state.isDisplayingMore) {
      case this.DISPLAYING.PHOTOS:
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
                            status => status === this.PHOTO_STATUS.SELECTED}
                          photosInTransfer={this.state.photosInTransfer}
                          distance={5}
                          handleClick={(i) => {
                            this.togglePhotoStatus(i)
                          }}
                          axis="xy"
                          onSortEnd={this.onPhotoSortEnd}/>
        );

      case this.DISPLAYING.PHOTOS_PREVIEW:
        return (
            <PhotoPreview
                photos={this.state.photos}
                imageMap={this.props.imageMap}
                isSelected={status => status === this.PHOTO_STATUS.SELECTED}
                isEditing={this.state.isEditing}
            ></PhotoPreview>
        );

      case this.DISPLAYING.MUSICS:
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

      case this.DISPLAYING.MOVIES:
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
              { this.generateRemovePanelFor("movies") }
            </div>
        );

      case this.DISPLAYING.LINKS:
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
              { this.generateRemovePanelFor("links") }
            </div>
        );

      case this.DISPLAYING.OTHERS:
        if (this.state.links.length === 0) {

        }

        return (
            <ExtraAttachments others={this.state.others}
                              isEditing={this.state.isEditing}
                              onChange={this.setOthersProperty}
                              removePanel={this.generateRemovePanelForOthers}
                              addPanel={this.generateAddPanelForOthers}
            >{this.state.isEditing}</ExtraAttachments>
        )
      default:
        // Not doing anything else since nothing is to be shown
    }
  }

  setIsDisplaying(isDisplaying) {
    if (this.state.isDisplayingMore === isDisplaying) {
      this.setState({
        isDisplayingMore: this.DISPLAYING.NONE
      });
    } else {
      this.setState({
        isDisplayingMore: isDisplaying
      });
    }
  }

  setOthersProperty(index, prop, value) {
    let {others} = this.state;
    others[index][prop] = value;

    this.setState({
      others: others
    });
  }

  restorePreviousBody() {
    let currentBody = this.state.body;
    this.setState({
      body: localStorage.previousBody
    });
    localStorage.previousBody = currentBody;
  }

  // region Listeners (on...Change)

  onDecreasingTextBodyWidth() {
    this.setState({
      bodyWidth: Math.max(this.state.bodyWidth - 5, 10)
    });
  }

  onIncreasingTextBodyWidth() {
    this.setState({
      bodyWidth: Math.min(this.state.bodyWidth + 5, 100)
    });
  }

  onTitleChange(event) {
    this.setState({
      title: event.target.value
    });
  }

  onBodyChange(event) {
    this.setState({
      body: event.target.value
    });
  }

  onBodyKeyDown(e) {
    if (e.key === "Tab") {
      e.preventDefault();

      let t = e.target,
          start = t.selectionStart,
          end = t.selectionEnd;

      // Set textarea value to text before caret + tab + text after caret
      t.value = t.value.substring(0, start) + "\t" + t.value.substring(end);

      // Put caret at right position again
      t.selectionStart = (t.selectionEnd) = start + 1;
    } else if (e.key === "Enter") {

      // Process the body
      let t = e.target,
          lines = t.value.split(/\r*\n/),
          {stats} = this.state;

      // Store this body
      localStorage.previousBody = t.value;

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
      let t = e.target;
      if (t.selectionEnd === t.value.length) {
        t.scrollTop = t.scrollHeight;
      }
    }
  }

  onPhotoSortEnd(obj) {
    this.setState({
      photos: arrayMove([...this.state.photos],
          obj.oldIndex,
          obj.newIndex),
    });
  }

  onMusicTitleChange(e) {
    var music = this.state.musics[0];
    music.title = e.target.value;
    this.setState({
      musics: [music]
    });
  }

  onMusicByChange(e) {
    var music = this.state.musics[0];
    music.by = e.target.value;
    this.setState({
      musics: [music]
    });
  }

  onMovieTitleChange(e) {
    var movie = this.state.movies[0];
    movie.title = e.target.value;
    this.setState({
      movies: [movie]
    });
  }

  onLinkTitleChange(e) {
    var link = this.state.links[0];
    link.title = e.target.value;
    this.setState({
      links: [link]
    });
  }

  onLinkUrlChange(e) {
    var link = this.state.links[0];
    link.url = e.target.value;
    this.setState({
      links: [link]
    });
  }

  onPromptYes(e) {
    this.hasUnsavedChanges = false;
    this.setState({hasPrompt: false});
  }

  onPromptNo(e) {
    // So that the editor won't take a look at that new thing
    this.version = this.props.version;
    this.setState({hasPrompt: false});
  }

  onPromptCancel(e) {
    this.props.onPromptCancel();
    this.setState({hasPrompt: false});
  }

  refreshPhoto() {
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
                this.PHOTO_STATUS.NOT_SELECTED)]
          });
        });
  }

  addAllPhotos() {
    for (let i = 0; i < this.state.photos.length; ++i) {
      if (this.state.photos[i].status !== this.PHOTO_STATUS.SELECTED) {
        this.togglePhotoStatus(i);
      }
    }
  }

  addToPhotosInTransfer(id) {
    if (this.state.photosInTransfer.indexOf(id) === -1) {
      this.setState({
        photosInTransfer: [...this.state.photosInTransfer, id],
      });
    }
  }

  removeFromPhotosInTransfer(id) {
    let index = this.state.photosInTransfer.indexOf(id);

    if (index !== -1) {
      this.state.photosInTransfer.splice(index, 1);
      this.forceUpdate();
    }
  }

  // endregion listeners

  // region Utility functions

  /**
   * Adds a space between English and Chinese, for example, 一a一 will become 一 a
   * 一
   * @param str
   */
  addSpaceBetweenCharacters(str) {
    return str.replace(/([\u00ff-\uffff])([A-Za-z0-9])/g, "$1 $2")
        .replace(/([A-Za-z0-9])([\u00ff-\uffff])/g, "$1 $2");
  }

  convertToDateTime(seconds) {
    const c = (i) => {
      return ("0" + i % 60).slice(-2);
    };

    let date = new Date(seconds);

    return c(date.getMonth() + 1) + c(date.getDate()) + (date.getFullYear() % 100) + " "
        + c(date.getHours()) + c(date.getMinutes());
  }

  convertFromDateTime(time) {
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

  convertToElapsed(seconds) {
    return `${parseInt(seconds / 60, 10)}:${("0" + seconds % 60).slice(-2)}`;
  }

  generateNewImageName(name, i) {
    let suffix = name.lastIndexOf(".");
    suffix = name.substr(suffix);

    return `${new Date().getTime()}_${i}${suffix}`;
  }

  // endregion

  render() {
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
                className={(this.state.isEditing && localStorage.previousBody) ? "" : "hidden"}
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
              <div className="stat chars">
                <AnimatedNumber value={R.count(this.state.body)}/>
              </div>
              <div className="stat times">
                <div className="time created">
                  {this.convertToDateTime(this.state.stats.timeCreated)}
                </div>
                <div className="time begin">
                  {this.convertToDateTime(this.state.stats.timeBegin)}
                </div>
                <div className="time end">
                  {this.convertToDateTime(this.state.stats.timeEnd)}
                </div>
              </div>
              <div className="stat elapsed">
                {this.convertToElapsed(this.state.timeElapsed)}
              </div>
            </div>
          </header>

          <div
              className={`text-body-wrapper ${this.state.isDisplayingMore === this.DISPLAYING.PHOTOS_PREVIEW ? "transparent" : ""}`}>
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
                    <pre className="text-body">{this.state.bodyObject}</pre>
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
                  className={`${this.state.isDisplayingMore !== this.DISPLAYING.PHOTOS && this.state.isDisplayingMore !== this.DISPLAYING.PHOTOS_PREVIEW ? "hidden" : ""} btn-breaker`}></span>
              <Toggle
                  className="btn"
                  isHidden={(this.state.isDisplayingMore !== this.DISPLAYING.PHOTOS && this.state.isDisplayingMore !== this.DISPLAYING.PHOTOS_PREVIEW) || !this.state.photos.length}
                  isChanging={this.state.isDisplayingMore === this.DISPLAYING.PHOTOS_PREVIEW}
                  onClick={this.togglePhotoPreview}
                  firstIcon="zoom_in"
                  secondIcon="zoom_out"
                  tooltip="Preview images"
              ></Toggle>
              <Button
                  className={(this.state.isDisplayingMore !== this.DISPLAYING.PHOTOS && this.state.isDisplayingMore !== this.DISPLAYING.PHOTOS_PREVIEW) || !this.state.isEditing ? "hidden" : ""}
                  onClick={this.refreshPhoto}
                  loading={this.state.isLoadingImages}
                  tooltip="Refresh available images"
              >refresh</Button>
              <Button
                  className={this.state.isDisplayingMore === this.DISPLAYING.PHOTOS && this.state.photos.length && this.state.isEditing ? "" : "hidden"}
                  onClick={this.addAllPhotos}
                  loading={this.state.photosInTransfer.length}
                  tooltip="Add all"
              >library_add</Button>
              <ImagePicker
                  className={this.state.isDisplayingMore === this.DISPLAYING.PHOTOS && this.state.isEditing ? "" : "hidden"}
                  onFinish={this.refreshPhoto} multiple
              />
              <span
                  className={`${this.state.isDisplayingMore !== this.DISPLAYING.PHOTOS && this.state.isDisplayingMore !== this.DISPLAYING.PHOTOS_PREVIEW ? "hidden" : ""} btn-breaker`}></span>
              { [["photos", "photo_library"],
                ["musics", "library_music"],
                ["movies", "movie"],
                ["links", "link"],
                ["others", "more_horiz"]].map(
                  tag => {
                    return (
                        <Toggle
                            key={tag[0]}
                            className={`${tag[0]} btn ${this.props.className || ""} ${this.state[tag[0]].length ? "underlined" : ""} ${this.state.isDisplayingMore === this.DISPLAYING[tag[0].toUpperCase()] ? "active" : ""}  `}
                            onClick={() => {
                              this.setIsDisplaying(this.DISPLAYING[tag[0].toUpperCase()])
                            }}
                            firstIcon={tag[1]}
                            secondIcon="add_circle_outline"
                            isChangingOnHover={true}
                            isChanging={!this.state[tag[0]].length}
                            disabled={this.state[tag[0]].length === 0 && !this.state.isEditing}
                        />
                    );
                  }) }
              <span className="btn-breaker"></span>
              <Button className={`${this.state.isEditing ? "" : "hidden"}`}
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
                className={`more-info ${this.state.isDisplayingMore === this.DISPLAYING.NONE ? "hidden" : ""}`}>
              {this.generateMoreInfo()}
            </div>
          </div>
        </div>
    );
  }
}

export default Editor;
