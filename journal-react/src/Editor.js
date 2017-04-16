import React, {Component} from 'react';
import {
    SortableContainer,
    SortableElement,
    arrayMove
} from 'react-sortable-hoc';
import NoScrollArea from "./NoScrollArea"

import './Editor.css';

var Ink = require("react-ink");
var AutosizeInput = require("react-input-autosize");

class ExtraButton extends Component {
  render() {
    return (
        <a className={`vertical-align btn ${this.props.className} ${this.props.isAttached ? "attached" : ""} ${this.props.isActive ? "active" : ""} `}
           onClick={this.props.onClick}
        >
          <Ink/>
          <i className="material-icons vertical-align-wrapper original">{this.props.icon}</i>
          <i className="material-icons vertical-align-wrapper add-circle">add_circle_outline</i>
        </a>
    );
  }
}

class Editor extends Component {

  DISPLAYING = {
    NONE  : -1,
    PHOTOS: 1,
    MUSICS: 2,
    MOVIES: 3,
    LINKS : 4,
    NEW   : 10,
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

  tagPrediction = this.props.tagPrediction.split(" ");

  constructor(props) {
    // todo use props to pre-fill the area
    super(props);

    this.state = {
      title           : "",
      body            : "",
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
      links           : []
    };

    if (!(props && props.release)) {
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
        tagPrediction   : "",
        isDisplayingMore: -1,
        photos          : [{
          id    : 1,
          src   : "http://placehold.it/320x150",
          status: this.PHOTO_STATUS.ADD,
        }, {
          id    : 2,
          src   : "http://placehold.it/350x150",
          status: this.PHOTO_STATUS.NOT_SELECTED,
        }, {
          id    : 3,
          src   : "http://placehold.it/330x150",
          status: this.PHOTO_STATUS.SELECTED,
        }, {
          id    : 4,
          src   : "http://placehold.it/350x120",
          status: this.PHOTO_STATUS.REMOVE,
        }, {
          id    : 5,
          src   : "http://placehold.it/30x150",
          status: this.PHOTO_STATUS.ADD,
        }, {
          id    : 6,
          src   : "http://placehold.it/150x150",
          status: this.PHOTO_STATUS.NOT_SELECTED,
        }, {
          id    : 7,
          src   : "http://placehold.it/350x150",
          status: this.PHOTO_STATUS.SELECTED,
        }, {
          id    : 8,
          src   : "http://placehold.it/350x150",
          status: this.PHOTO_STATUS.REMOVE,
        }
          // ,{
          //     id    : 11,
          //     src   : "http://placehold.it/320x150",
          //     status: this.PHOTO_STATUS.ADD,
          // }, {
          //     id    : 21,
          //     src   : "http://placehold.it/350x150",
          //     status: this.PHOTO_STATUS.NOT_SELECTED,
          // }, {
          //     id    : 31,
          //     src   : "http://placehold.it/330x150",
          //     status: this.PHOTO_STATUS.SELECTED,
          // }, {
          //     id    : 41,
          //     src   : "http://placehold.it/350x120",
          //     status: this.PHOTO_STATUS.REMOVE,
          // }, {
          //     id    : 51,
          //     src   : "http://placehold.it/30x150",
          //     status: this.PHOTO_STATUS.ADD,
          // }, {
          //     id    : 61,
          //     src   : "http://placehold.it/150x150",
          //     status: this.PHOTO_STATUS.NOT_SELECTED,
          // }, {
          //     id    : 71,
          //     src   : "http://placehold.it/350x150",
          //     status: this.PHOTO_STATUS.SELECTED,
          // }, {
          //     id    : 81,
          //     src   : "http://placehold.it/350x150",
          //     status: this.PHOTO_STATUS.REMOVE,
          // },{
          //     id    : 12,
          //     src   : "http://placehold.it/320x150",
          //     status: this.PHOTO_STATUS.ADD,
          // }, {
          //     id    : 22,
          //     src   : "http://placehold.it/350x150",
          //     status: this.PHOTO_STATUS.NOT_SELECTED,
          // }, {
          //     id    : 32,
          //     src   : "http://placehold.it/330x150",
          //     status: this.PHOTO_STATUS.SELECTED,
          // }, {
          //     id    : 42,
          //     src   : "http://placehold.it/350x120",
          //     status: this.PHOTO_STATUS.REMOVE,
          // }, {
          //     id    : 52,
          //     src   : "http://placehold.it/30x150",
          //     status: this.PHOTO_STATUS.ADD,
          // }, {
          //     id    : 62,
          //     src   : "http://placehold.it/150x150",
          //     status: this.PHOTO_STATUS.NOT_SELECTED,
          // }, {
          //     id    : 72,
          //     src   : "http://placehold.it/350x150",
          //     status: this.PHOTO_STATUS.SELECTED,
          // }, {
          //     id    : 82,
          //     src   : "http://placehold.it/350x150",
          //     status: this.PHOTO_STATUS.REMOVE,
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
        }]
      };
    }

    setInterval(() => {
      // On purpose: to avoid laggy update
      // eslint-disable-next-line
      ++this.state.timeElapsed;
    }, 1000);

    this.setIsDisplaying = this.setIsDisplaying.bind(this);
    this.generateMoreInfo = this.generateMoreInfo.bind(this);
    this.generateAddPanelFor = this.generateAddPanelFor.bind(this);
    this.generateRemovePanelFor = this.generateRemovePanelFor.bind(this);
    this.getTagPrediction = this.getTagPrediction.bind(this);
    this.onTitleChange = this.onTitleChange.bind(this);
    this.onBodyChange = this.onBodyChange.bind(this);
    this.onNewTagKeyDown = this.onNewTagKeyDown.bind(this);
    this.onNewTagChange = this.onNewTagChange.bind(this);
    this.onPhotoSortEnd = this.onPhotoSortEnd.bind(this);
    this.onMusicByChange = this.onMusicByChange.bind(this);
    this.onMusicTitleChange = this.onMusicTitleChange.bind(this);
    this.onMovieTitleChange = this.onMovieTitleChange.bind(this);
    this.onLinkTitleChange = this.onLinkTitleChange.bind(this);
    this.onLinkUrlChange = this.onLinkUrlChange.bind(this);
  }

  generateCurrentTags() {
    const tagItems = this.state.tags.map((tag, index) => {
      return (
          <span
              key={`tag-${tag}`}
              className="tag"
              onClick={(event) => {this.removeTagAtIndex(index);}}
          >{tag}</span>
      );
    });
    return (
        <NoScrollArea padding="10px">
          <div className="tags-wrapper">
            <div className="tags">
              { tagItems }
                <span className="tag white-background new-tag-wrapper">
                  <span className="prediction">{this.state.tagPrediction}</span>
                  <input
                      type="text"
                      className="new-tag normal underlined"
                      onKeyDown={this.onNewTagKeyDown}
                      onChange={this.onNewTagChange}
                  />
                </span>
            </div>
          </div>
        </NoScrollArea>
    );
  }

  removeTagAtIndex(index) {
    var tags = this.state.tags;
    tags.splice(index, 1);

    this.setState({
      tags: tags
    });
  }

  /**
   * Toggles the photo status - whether it's going to be added or removed
   */
  togglePhotoStatus(i) {
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

  generateRemovePanelFor(tag) {
    var state = {};
    state[tag] = [];
    return (
        <a className="icon"
           onClick={() => {this.state.isDisplayingMore = this.DISPLAYING.NONE; this.setState(state);} }
        >
          <i className="material-icons">remove_circle_outline</i>
        </a>
    );
  }

  generateMoreInfo() {
    switch (this.state.isDisplayingMore) {
      case this.DISPLAYING.PHOTOS:
        const SortableItem = SortableElement(({item}) =>
            <div
                className={`photo ${(item.status === this.PHOTO_STATUS.ADD || item.status === this.PHOTO_STATUS.SELECTED) ? "selected" : ""} `}
                onClick={() => {this.togglePhotoStatus(item.index)}}
            >
              <img src={item.src}
                   alt=""
                   height="90px"/>
            </div>
        );

        const SortableList = SortableContainer(({items}) => {
          return (
              <NoScrollArea padding="10px">
                <div className="more-info-wrapper">
                  <div
                      className="photos">
                    {items.map((item, index) => {
                      item.index = index;
                      return (
                          <SortableItem key={`photo-${index}`}
                                        index={index}
                                        item={item}/>
                      );
                    })}
                    <div className="wrapper"></div>
                  </div>
                </div>
              </NoScrollArea>
          );
        });

        return (
            <SortableList items={this.state.photos}
                          distance={5}
                          axis="xy"
                          onSortEnd={this.onPhotoSortEnd}/>
        );
      case this.DISPLAYING.MUSICS:
        if (this.state.musics.length === 0) {
          // eslint-disable-next-line
          this.state.musics = [{title: "", by: ""}];
        }
        return (
            <div className="music more-info-wrapper">
              <AutosizeInput
                  className="title normal underlined"
                  onChange={this.onMusicTitleChange}
                  value={this.state.musics[0].title || ""}/>
              <span className="text">By</span>
              <AutosizeInput
                  type="text"
                  className="by normal underlined"
                  onChange={this.onMusicByChange}
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
                  className="title normal underlined"
                  onChange={this.onMovieTitleChange}
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
                  className="title normal underlined"
                  onChange={this.onLinkTitleChange}
                  value={this.state.links[0].title || ""}/>
              <span className="text"> - ://</span>
              <AutosizeInput
                  type="text"
                  className="url normal underlined"
                  onChange={this.onLinkUrlChange}
                  value={this.state.links[0].url || ""}/>
              { this.generateRemovePanelFor("links") }
            </div>
        );
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

  getTagPrediction(value) {
    if (value) {
      for (let prediction of this.tagPrediction) {
        if (prediction.startsWith(value)) {
          if (this.state.tags.indexOf(prediction) === -1) {
            return prediction;
          }
        }
      }
    }

    return value;
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

  onNewTagKeyDown(event) {
    if (event.key === "Tab") {

      event.preventDefault();
      event.target.value = this.state.tagPrediction;

    } else if (event.key === "Enter") {

      let newTags = [...this.state.tags],
          newTag = event.target.value.trim();

      // Only add it when not found
      if (newTag.length && newTags.indexOf(newTag) === -1) {
        newTags.push(newTag);
        this.setState({
          tags         : newTags,
          tagPrediction: "",
        });
      }

      event.target.value = "";

    } else if (event.key === "Backspace") {

      if (!event.target.value && this.state.tags.length) {
        let newTags = [...this.state.tags];
        event.target.value = (newTags.pop() || "") + " ";

        this.setState({
          tags: newTags
        });
      }
    }
  }

  onNewTagChange(event) {
    this.setState({
      tagPrediction: this.getTagPrediction(event.target.value),
    });
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

  countChars(str) {
    return (str.match(/[\u00ff-\uffff]|\S+/g) || []).length;
  }

  convertToDateTime(seconds) {
    return "131333 2323";
  }

  convertToElapsed(seconds) {
    return `${parseInt(seconds / 60, 10)}:${("0" + seconds % 60).slice(-2)}`;
  }

  render() {
    return (
        <div className="Editor">
          <div className="header">
            <AutosizeInput className="title normal underlined"
                           value={this.state.title}
                           onChange={this.onTitleChange}
            />
            <div className="stats">
              <div className="stat chars">
                { this.countChars(this.state.body) }
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
          </div>
          <div className="text-body-wrapper">
            <div className="text-body-wrapper-2">
              <NoScrollArea>
                <textarea className="text-body"
                          value={this.state.body}
                          onChange={this.onBodyChange}
                >
                </textarea>
              </NoScrollArea>
            </div>
            <span className="wrapper right"/>
          </div>
          <div className="shadow up"></div>
          <div className="extras">
            <div className="buttons">
              <a className="vertical-align btn tags">
                <Ink/>
                <i className="material-icons vertical-align-wrapper">label_outline</i>
              </a>
              { this.generateCurrentTags() }
              { [["photos", "photo_library"],
                ["musics", "library_music"],
                ["movies", "movie"],
                ["links", "link"]].map(
                  tag => {
                    return (
                        <ExtraButton
                            key={tag[0]}
                            className={tag[0]}
                            isAttached={this.state[tag[0]].length}
                            isActive={this.state.isDisplayingMore === this.DISPLAYING[tag[0].toUpperCase()]}
                            onClick={() => { this.setIsDisplaying(this.DISPLAYING[tag[0].toUpperCase()]) }}
                            icon={tag[1]}
                        />
                    );
                  }) }
              <a className={`vertical-align btn new ${this.state.isDisplayingMore === this.DISPLAYING.NEW ? "active" : "" }`}
                 onClick={() => {this.setIsDisplaying(this.DISPLAYING.NEW);}}
              >
                <Ink/>
                <i className="material-icons vertical-align-wrapper">more_horiz</i>
              </a>
              <a className="vertical-align btn send accent">
                <Ink/>
                <i className="vertical-align-wrapper material-icons">send</i>
              </a>
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
