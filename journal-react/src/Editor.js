import React, {Component} from 'react';
import {
    SortableContainer,
    SortableElement,
    arrayMove
} from 'react-sortable-hoc';
import NoScrollArea from "./NoScrollArea";
import Toggle from "./Toggle";
import PredictionInputs from "./PredictionInputs";
import Button from "./Button";
import NumberCard from "./NumberCard";

var Ink = require("react-ink");
var AutosizeInput = require("react-input-autosize");

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
                onChange={(e) => {this.setState({key: e.target.value});}}
                disabled={!isEditing}
            />
            <span className="text">:</span>
            <input
                type="text"
                className={`normal underlined ${isEditing ? "" : "disabled"}`}
                value={this.state.value}
                onChange={(e) => {this.setState({value: e.target.value});}}
                disabled={!isEditing}
                onKeyDown={(e) => {if (e.key === "Enter") {onClickAdd();}}}
            />
            <a className={`icon ${isEditing ? "" : "transparent"} `}
               onClick={onClickAdd}
            >
              <i className="material-icons">add_circle_outline</i>
            </a>
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
                              onBlur={(e) => {this.props.onChange(index, prop, e.target.value);}}
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
              // todo make this editable
              return (
                  <div key={`other-${index}`}
                       className="other-wrapper">
                    <div className="other">
                      <div className="type-wrapper">
                        <input
                            className={`flex-extend-inner-wrapper type normal ${this.props.isEditing ? "" : "disabled"}`}
                            value={other.type}
                            onChange={(e) => {this.props.onChange(index, "type", e.target.value);}}
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

  state = {
    previewIndex: 0,
  };

  render() {
    if (this.props.photos.length === 0) {
      return;
    }

    let {photos, isSelected, isEditing} = this.props;
    let src = photos[this.state.previewIndex].src;

    return (
        <div className="photo-preview flex-extend-inner-wrapper">
          <div className="flex-extend-inner-wrapper flex column">
            <div className="photo-previewed-wrapper">
              <div className="flex-extend-inner-wrapper">
                <div
                    onClick={() => {window.open(src)}}
                    className=" photo-wrapper">
                  <img className="center"
                       src={src} alt=""/>
                </div>
              </div>
            </div>
            <div className="photo-no-scroll">
              <NoScrollArea padding="10px">
                <div className={`photos ${isEditing ? "show-all" : ""} `}>
                  {photos.map((photo, index) =>
                      <div key={`photo-preview-${photo.id}`}
                           className={`photo ${isSelected(photo.status) ? "selected": ""} `}
                           onMouseOver={() => {this.setState({previewIndex: index})}}
                      >
                        <img src={photo.src} alt="" height="90px"/>
                      </div>
                  )}
                </div>
              </NoScrollArea>
            </div>
          </div>
        </div>
    );
  }
}

const SortableItem = SortableElement(({item, status, i, isSelected, handleClick}) =>
    <div
        className={`photo ${isSelected(status) ? "selected" : ""} `}
        onClick={() => {handleClick(i);}}
    >
      <img src={item.src}
           alt=""
           height="90px"/>
    </div>
);

const SortableList = SortableContainer(({items, isEditing, isSelected, handleClick}) => {
  return (
      <NoScrollArea padding="10px">
        <div className="more-info-wrapper">
          <div
              className={`photos ${isEditing ? "show-all" : ""} `}>
            {items.map((item, index) => {

              return (
                  <SortableItem key={`photo-${item.id}`}
                                status={item.status}
                                isSelected={isSelected}
                                index={index}
                                i={index}
                                handleClick={handleClick}
                                disabled={!isEditing}
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
  PHOTO_STATUS = {
    NOT_SELECTED: 0b10,
    ADD         : 0b01,
    REMOVE      : 0b00,
    SELECTED    : 0b11,
  };

  constructor(props) {
    // todo use props to pre-fill the area
    super(props);

    this.state = {
      title           : this.convertToDateTime(new Date()).substr(0, 7),
      body            : "",
      bodyWidth       : this.props.bodyWidth || 80,
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
    };

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
    this.toggleEditMode = this.toggleEditMode.bind(this);
    this.togglePhotoPreview = this.togglePhotoPreview.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    this.toggleDarkMode = this.toggleDarkMode.bind(this);
  }

  removeTagAtIndex(index) {
    if (!this.state.isEditing) {
      return false;
    }

    var tags = this.state.tags;
    tags.splice(index, 1);

    this.setState({
      tags: tags
    });
  }

  /**
   * Toggles the photo preview - whether the user is presented with a larger
   * preview of the photo
   */
  togglePhotoPreview() {
    let state = this.state.isDisplayingMore === this.DISPLAYING.PHOTOS_PREVIEW ? this.DISPLAYING.PHOTOS : this.DISPLAYING.PHOTOS_PREVIEW;

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

    var newPhotos = this.state.photos;
    newPhotos[i].status = ~newPhotos[i].status & 0b11;
    this.setState({
      photos: newPhotos
    });
  }

  generateAddPanelFor(tag, state) {
    return (
        <div className="more-info-wrapper">
          <a className="icon-wrapper"
             onClick={() => { this.setState(state); }}
          >
            <i className="material-icons">add_circle_outline</i>
          </a>
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
        <a className={`icon ${this.state.isEditing ? "" : "transparent"} `}
           onClick={handleClick}
        >
          <i className="material-icons">remove_circle_outline</i>
        </a>
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
    if (propKey) {
      // Remove a specific property
      let handleClick = () => {
        let others = this.state.others;
        delete others[otherIndex][propKey];

        this.setState({others: others});
      };

      return (
          <a className={`icon ${this.state.isEditing ? "" : "transparent"} `}
             onClick={handleClick}
          >
            <i className="material-icons">remove_circle_outline</i>
          </a>
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
          <a className={`icon ${this.state.isEditing ? "" : "transparent"} `}
             onClick={handleClick}
          >
            <i className="material-icons">remove_circle</i>
          </a>
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
          <a className={`icon ${this.state.isEditing ? "" : "transparent"} `}
             onClick={handleClick}
          >
            <i className="material-icons">add_circle_outline</i>
          </a>
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
        return (
            <SortableList items={this.state.photos}
                          isEditing={this.state.isEditing}
                          isSelected={(status) => {return (status === this.PHOTO_STATUS.ADD || status === this.PHOTO_STATUS.SELECTED)}}
                          distance={5}
                          handleClick={(i) => {this.togglePhotoStatus(i)}}
                          axis="xy"
                          onSortEnd={this.onPhotoSortEnd}/>
        );

      case this.DISPLAYING.PHOTOS_PREVIEW:
        return (
            <PhotoPreview
                photos={this.state.photos}
                isSelected={(status) => {return (status === this.PHOTO_STATUS.ADD || status === this.PHOTO_STATUS.SELECTED)}}
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
          isChanged = false,
          {stats} = this.state;

      const tags = [["Begin @ ", "timeBegin"],
        ["End @ ", "timeEnd"],
        ["Created @ ", "timeCreated"]];

      for (let i = 0; i < lines.length; ++i) {
        let line = lines[i];

        for (let pair of tags) {
          if (line.startsWith(pair[0])) {
            let time = this.convertFromDateTime(line.substring(pair[0].length));
            if (time && new Date(time).getFullYear() === this.props.year) {
              stats[pair[1]] = time;
              isChanged = true;

              lines.splice(i--, 1);

              break;
            }
          }
        }
      }

      if (isChanged) {
        this.setState({
          stats: stats,
          body : lines.join("\r\n"),
        });
      }
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

  // endregion listeners

  countChars(str) {
    return (str.match(/[\u00ff-\uffff]|\S+/g) || []).length;
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

  toggleEditMode() {
    this.setState({
      isEditing: !this.state.isEditing
    });
  }

  render() {
    return (
        <div className={`Editor ${this.state.isDarkMode ? "dark" : ""}`}>
          <nav className="nav has-hint">
            <Button className={`${this.state.isFullscreen ? "" : "hidden"}`}
                    onClick={this.toggleDarkMode}>highlight</Button>
            <Button onClick={this.onDecreasingTextBodyWidth}>format_indent_decrease</Button>
            <Button onClick={this.onIncreasingTextBodyWidth}>format_indent_increase</Button>
            <Toggle
                className="btn fullscreen"
                isChanging={this.state.isFullscreen}
                onClick={this.toggleFullscreen}
                firstIcon="fullscreen"
                secondIcon="fullscreen_exit"
            />
            <Button className="hint">more_vert</Button>
          </nav>

          <header
              className={`${this.state.isDisplayingMore === this.DISPLAYING.PHOTOS_PREVIEW ? "hidden" : ""}`}>
            <input
                className={`title normal underlined ${this.state.isFullscreen ? "hidden" : ""}`}
                value={this.state.title}
                onChange={this.onTitleChange}
                disabled={!this.state.isEditing}
                defaultValue={this.convertToDateTime(new Date()).substr(0, 7)}
            />
            <div className="stats">
              <div className="stat chars">
                <NumberCard value={this.countChars(this.state.body)}/>
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
              className={`text-body-wrapper ${this.state.isDisplayingMore === this.DISPLAYING.PHOTOS_PREVIEW ? "hidden" : ""}`}>
            <div className="text-body-wrapper-2"
                 style={{padding: `0 ${50-this.state.bodyWidth/2}%`, width: `${this.state.bodyWidth}%`}}
            >
              <NoScrollArea
                  backgroundColor={`${this.state.isDarkMode ? "#212121" : "white"}`}>
                <textarea className="text-body"
                          value={this.state.body}
                          onChange={this.onBodyChange}
                          onKeyDown={this.onBodyKeyDown}
                          disabled={!this.state.isEditing}/>
              </NoScrollArea>
            </div>
          </div>
          <div
              className={`shadow up ${this.state.isFullscreen ? "hidden" : ""}`}></div>
          <div
              className={`extras ${this.state.isDisplayingMore === this.DISPLAYING.PHOTOS_PREVIEW ? "extend" : ""} ${this.state.isFullscreen ? "hidden" : ""} `}>
            <div className="buttons">
              <a className="vertical-align btn tags">
                <Ink/>
                <i className="material-icons vertical-align-wrapper">label_outline</i>
              </a>
              <div className="current-tags-wrapper">
                <PredictionInputs
                    className={`tag white-background new-tag-wrapper ${!this.state.isEditing ? "hidden" : ""}`}
                    tagPrediction={this.props.tagPrediction}
                    tags={this.state.tags}
                    onChange={tags => this.setState({tags: tags})}
                />
              </div>
              <div className="flex-last-item"></div>
              <Toggle
                  className="btn"
                  isHidden={this.state.isDisplayingMore !== this.DISPLAYING.PHOTOS && this.state.isDisplayingMore !== this.DISPLAYING.PHOTOS_PREVIEW}
                  isChanging={this.state.isDisplayingMore === this.DISPLAYING.PHOTOS_PREVIEW}
                  onClick={this.togglePhotoPreview}
                  firstIcon="expand_less"
                  secondIcon="expand_more"
              ></Toggle>
              <span className="breaker"></span>
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
                            onClick={() => { this.setIsDisplaying(this.DISPLAYING[tag[0].toUpperCase()]) }}
                            firstIcon={tag[1]}
                            secondIcon="add_circle_outline"
                            isChangingOnHover={true}
                            isChanging={!this.state[tag[0]].length}
                        />
                    );
                  }) }
              <span className="breaker"></span>
              <Button className={`${this.state.isEditing ? "" : "hidden"}`}
                      onClick={()=>{console.log("TOdo")}}>delete</Button>
              <Toggle
                  className="btn send-edit accent"
                  isChanging={!this.state.isEditing}
                  firstIcon="send"
                  secondIcon="mode_edit"
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
