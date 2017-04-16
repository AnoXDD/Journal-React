import React, {Component} from 'react';
import {
    SortableContainer,
    SortableElement,
    arrayMove
} from 'react-sortable-hoc';

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
          <i className="material-icons vertical-align-wrapper">{this.props.icon}</i>
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
    this.onTitleChange = this.onTitleChange.bind(this);
    this.onBodyChange = this.onBodyChange.bind(this);
    this.onNewTagKeyPress = this.onNewTagKeyPress.bind(this);
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
              className="vertical-align-wrapper tag"
              onClick={(event) => {this.removeTagAtIndex(index);}}
          >{tag}</span>
      );
    });
    return (
        <div className="vertical-align tags">
          { tagItems }
                <span className="vertical-align-wrapper tag white-background">
                <input
                    type="text"
                    className="new-tag normal underlined"
                    onKeyPress={this.onNewTagKeyPress}
                />
                </span>
        </div>
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
              <div className="no-scroll more-info-wrapper">
                <div
                    className="photos no-scroll-wrapper">
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
          );
        });

        return (
            <SortableList items={this.state.photos}
                          distance={5}
                          axis="xy"
                          onSortEnd={this.onPhotoSortEnd}/>
        );
      case this.DISPLAYING.MUSICS:
        return (
            <div className="music more-info-wrapper">
              <AutosizeInput
                  className="title normal underlined"
                  onChange={this.onMusicTitleChange}
                  value={this.state.musics[0].title}/>
              <span className="text">By</span>
              <AutosizeInput
                  type="text"
                  className="by normal underlined"
                  onChange={this.onMusicByChange}
                  value={this.state.musics[0].by}/>
            </div>
        );
      case this.DISPLAYING.MOVIES:
        return (
            <div className="movie more-info-wrapper">
              <AutosizeInput
                  className="title normal underlined"
                  onChange={this.onMovieTitleChange}
                  value={this.state.movies[0].title}
              ></AutosizeInput>
            </div>
        );
      case this.DISPLAYING.LINKS:
        return (
            <div className="link more-info-wrapper">
              <AutosizeInput
                  className="title normal underlined"
                  onChange={this.onLinkTitleChange}
                  value={this.state.links[0].title}/>
              <span className="text"> - ://</span>
              <AutosizeInput
                  type="text"
                  className="url normal underlined"
                  onChange={this.onLinkUrlChange}
                  value={this.state.links[0].url}/>
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

  onNewTagKeyPress(event) {
    if (event.key === "Enter") {
      var newTags = [...this.state.tags],
          newTag = event.target.value.trim();

      // Only add it when not found
      if (newTag.length && newTags.indexOf(newTag) === -1) {
        newTags.push(newTag);
        this.setState({
          tags: newTags
        });
      }

      event.target.value = "";
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

  countChars(str) {
    return (str.match(/[\u00ff-\uffff]|\S+/g) || []).length;
  }

  convertToDateTime(seconds) {
    return "131333 2323";
  }

  convertToElapsed(seconds) {
    return `${parseInt(seconds / 60)}:${("0" + seconds % 60).slice(-2)}`;
  }

  render() {
    return (
        <div className="Editor">
          <div className="header">
            <input className="title"
                   value={this.state.title}
                   onChange={this.onTitleChange}
            >
            </input>
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
          <div className="no-scroll text-body-wrapper">
                    <textarea className="no-scroll-wrapper text-body"
                              value={this.state.body}
                              onChange={this.onBodyChange}
                    >
                    </textarea>
            <span className="wrapper right"></span>
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
                        ></ExtraButton>
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
