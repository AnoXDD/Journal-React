/**
 * Created by Anoxic on 042217.
 * The main list to show all the entries given
 */

import React, {Component} from "react";
import NoScrollArea from "./NoScrollArea";
import Button from "./Button";
import Image from "./Image";
import OneDriveManager from "./OneDriveManager";

import R from "./R";

class BulbImageView extends Component {

  // todo display something if `src` is broken
  render() {
    return (
        <div
            onClick={this.props.onClickHide}
            className={`bulb-image-viewer ${this.props.className || ""}`}>
          <nav className="nav">
            <Button onClick={this.props.onClickHide}>close</Button>
          </nav>
          <div className="bulb-image-viewer-wrapper">
            <Image
                blank={true}
                onClick={true}
                src={`${this.props.src || ""}`}
            />
          </div>
        </div>
    );
  }
}

class ContentArticle extends Component {

  constructor(props) {
    super(props);

    this.state = {
      image     : (props.article.images && this.props.imageMap[props.article.images[0]]) ? this.props.imageMap[props.article.images[0]].thumbnail : undefined,
      isRemoving: false,
    };

    this.handleRemoveClick = this.handleRemoveClick.bind(this);
  }

  handleMouseMove(e, images) {
    let i = parseInt(Math.min((e.clientX - e.target.getBoundingClientRect().left) / e.target.offsetWidth,
            .999999999) * images.length, 10);

    if (this.props.imageMap[images[i]]) {
      this.setState({
        image: this.props.imageMap[images[i]].thumbnail,
      });
    }
  }

  handleRemoveClick(e) {
    this.setState({
      isRemoving: true
    });

    this.props.onRemoveClick()
        .then(() => {
          // Nothing needs to be done since it will be gone
        }, () => {
          this.setState({
            isRemoving: false,
          });
        });

    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    let {style, article, time} = this.props,
        articleProp = {
          className: `${this.props.className || ""}`,
          style    : style,
          onClick  : this.props.onClick,
        };

    if (article.images) {
      articleProp.onMouseMove = e => this.handleMouseMove(e, article.images);
    }

    return (
        <article {...articleProp}>
          <Image src={this.state.image}/>
          <div className="text">
            <div className="flex-filler"></div>
            <div className="title">{article.title}</div>
            <div className="time">{time}</div>
            <div className="details">{article.body}</div>
          </div>
          <Button
              className={this.props.className === " no-image" ? "" : "dark"}
              loading={this.state.isRemoving}
              onClick={this.handleRemoveClick}
          >delete</Button>
        </article>
    );
  }
}

class ContentBulb extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isRemoving: false,
    };

    this.handleRemoveClick = this.handleRemoveClick.bind(this);
  }

  handleRemoveClick(e) {
    this.setState({
      isRemoving: true
    });

    this.props.onRemoveClick()
        .then(() => {
          // Nothing needs to be done since it will be gone
        }, () => {
          this.setState({
            isRemoving: false,
          });
        });

    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    let {bulb} = this.props;

    return (
        <article {...this.props.style}>
          <div className="hover-trigger"></div>
          <div className="bulb-content">
            <div className="bulb-content-inner">
              <header className="time flex-center">
                {this.props.time}
              </header>
              <div className="details">{bulb.body}</div>
            </div>
          </div>
          <div className="buttons flex-center">
            <Button
                onClick={this.props.onLocationClick}
                className={bulb.place ? "" : "hidden"}>
              location_on
            </Button>
            <Button
                onClick={this.props.onPhotoClick}
                className={bulb.images && bulb.images.length ? "" : "hidden"}>
              photo
            </Button>
            <Button loading={this.state.isRemoving}
                    onClick={this.handleRemoveClick}>delete</Button>
          </div>
        </article>
    )
  }
}

class EntryList extends Component {

  currentVersion = 0;
  currentImage = "";

  constructor(props) {
    super(props);

    this.generateArticleList = this.generateArticleList.bind(this);
    this.generateBulbList = this.generateBulbList.bind(this);
    this.handlePhotoClick = this.handlePhotoClick.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.version !== this.currentVersion;
  }

  /**
   * Generate a form list "Yesterday 12:34 - 12:56"
   */
  generateHumanFormTimeFromArticle(time) {
    var date = new Date(time.begin || time.created),
        hour = date.getHours(),
        minute = date.getMinutes(),
        year = date.getFullYear(),
        now = new Date(),
        nowYear = now.getFullYear(),
        month = date.getMonth(),
        day = date.getDate(),
        dateHeader;

    if (year === nowYear) {
      var firstDay = new Date(year, 0, 1),
          yearDay = Math.floor((date - firstDay) / 86400000),
          nowYearDay = Math.floor((now - firstDay) / 86400000);
      // Test for today and yesterday
      if (yearDay === nowYearDay) {
        // Test for hours
        var deltaMinutes = Math.floor((now - date) / 60000);
        if (deltaMinutes === 0) {
          return "Just now";
        } else if (deltaMinutes < 60) {
          // Within an hour
          return deltaMinutes + " min";
        } else {
          // Within today
          return Math.floor(deltaMinutes / 60) + " hr";
        }
      } else if (yearDay + 1 === nowYearDay) {
        dateHeader = "Yester";
      } else {
        // Test for this week
        var firstWeekDay = firstDay.getDay(),
            yearWeek = Math.floor((yearDay - firstWeekDay) / 7),
            nowYearWeek = Math.floor((nowYearDay - firstWeekDay) / 7);
        dateHeader = "";
        switch (nowYearWeek - yearWeek) {
          case 1:
            // It was the last week
            // Intentionally omit `break`
            // eslint-disable-next-line
          case 0:
            // It is this week
            dateHeader += R.weekday[date.getDay()];
            break;
          default:
            dateHeader = R.month[month] + " " + day;
            break;
        }
      }
    } else {
      dateHeader = R.month[month] + " " + day;
    }

    minute = minute < 10 ? "0" + minute : minute;
    hour = hour < 10 ? "0" + hour : hour;
    dateHeader += " " + hour + ":" + minute;

    if (!time.end) {
      return dateHeader;
    }

    // Get the time of when it ends
    date = new Date(time.end);
    dateHeader += " - " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(
            -2);

    return dateHeader;
  }

  generateArticleStyle(article) {
    let className = "";
    if (article.images && article.images.length) {
      // background = `url('${this.props.imageMap[article.images[0]] ||
      // "https://unsplash.it/300/200/?random"}')`;
    } else {
      className += " no-image";
    }

    return {
      className: className,
      style    : {
        top: this.props.contentStyle[article.time.created],
      },
    };
  }

  generateArticleList() {
    return (
        <div className="article-list">
          <div className="flex-extend-inner-wrapper">
            {this.props.articles.map((article, index) => {
              return (
                  <ContentArticle
                      onClick={() => this.props.onArticleClick(index)}
                      onRemoveClick={() => this.props.onArticleRemove(index)}
                      article={article}
                      imageMap={this.props.imageMap}
                      key={`article-preview-${article.time.created}`}
                      time={this.generateHumanFormTimeFromArticle(article.time)}
                      {...this.generateArticleStyle(article)}
                  />
              );
            })}
          </div>
        </div>
    );
  }

  generateBulbProp(bulb, i) {
    let top = this.props.contentStyle[bulb.time.created],
        prop = {
          className: `${top >= this.props.scrollTop && top <= this.props.scrollBottom ? "" : "hidden"} ${this.props.highlightBulbIndex === i ? "active" : ""}`,
          style    : {top: top},
        };

    // if (this.props.debug) {
    //   bulb.images = [undefined];
    //
    //   let rand = (bulb.time.created / 1000) % 5;
    //   prop.onClick = () => {
    //     this.props.onBulbClick(bulb.images[0] ||
    // `https://unsplash.it/300/${200 + rand * 100}?image=${rand}`); }; } else
    // if (bulb.images) {  prop.onClick = () => {
    // this.props.onBulbClick(this.props.imageMap[bulb.images[0]].thumbnail);
    // }; }

    return prop;
  }

  generateBulbList() {
    return (
        <div className="bulb-list"
             style={{height: `${this.props.contentStyle.height || 0}px`}}>
          <div className="flex-extend-inner-wrapper">
            {this.props.bulbs.map((bulb, i) => {
              return (
                  <ContentBulb key={`bulb-preview-${bulb.time.created}`}
                               style={this.generateBulbProp(bulb, i)}
                               bulb={bulb}
                               time={this.generateHumanFormTimeFromArticle(bulb.time)}
                               onLocationClick={() => this.props.onLocationClick(
                                   bulb.place)}
                               onPhotoClick={() => this.handlePhotoClick(bulb.images[0])}
                               onRemoveClick={() => this.props.onBulbRemove(i)}
                  />
              );
            })}
          </div>
        </div>
    );
  }

  handlePhotoClick(imageName) {
    this.currentImage = imageName;

    let mapElem = this.props.imageMap[imageName];
    if (mapElem) {
      if (mapElem.url) {
        this.props.onBulbClick(mapElem.url);
      } else {
        // Try to get the url
        this.props.onBulbClick(mapElem.thumbnail);

        OneDriveManager.updateImageMapElement(mapElem)
            .then(newElem => {
              if (this.currentImage === imageName) {
                // Update the viewer with new image
                let image = new window.Image();
                image.onload = () => {
                  if (this.currentImage === imageName) {
                    this.props.onBulbClick(mapElem.url);
                  }
                };
                image.src = mapElem.url;
              }
            });
      }
    }
  }

  render() {
    return (
        <div className="entries">
          {this.generateArticleList()}
          <div className="timeline-wrapper">
                <span className="timeline"
                      style={{height: `${this.props.contentStyle.height || 0}px`}}/>
          </div>
          {this.generateBulbList()}
        </div>
    );
  }
}

export default class EntryView extends Component {

  UPDATE_TRIGGER = 2000;
  UPDATE_STEP = 5000;

  /**
   * The time between the next bulb image shows up
   * @type {number}
   */
  BULB_IMAGE_COOLDOWN = 10;

  isBulbImageCooldown = false;

  constructor(props) {
    super(props);

    this.state = {
      bulbImage          : "",
      isShowingBulbViewer: "",
      scrollTop          : 0,
      scrollBottom       : this.UPDATE_STEP,

      version       : 0,
      displayVersion: 0,
    };

    this.hideBulbViewer = this.hideBulbViewer.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleBulbClick = this.handleBulbClick.bind(this);
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("scroll", this.handleScroll.bind(this));
  }

  componentDidMount() {
    this.refs.scrollArea.addEventListener("scroll",
        this.handleScroll.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    this.refs.scrollArea.removeEventListener("scroll",
        this.handleScroll.bind(this));
  }

  componentWillUpdate(nextProps, nextState) {
    // Handles the scroll top and image index
    if (nextProps.version > nextState.displayVersion) {
      nextState.displayVersion = nextProps.version;

      this.refs.scrollArea.removeEventListener("scroll",
          this.handleScroll.bind(this));
      this.refs.scrollArea.scrollTop = nextProps.scrollTop;
      this.refs.scrollArea.addEventListener("scroll",
          this.handleScroll.bind(this));

      // Handles highlightbulb index to update which image is currently on
      // display
      if (nextProps.highlightBulbIndex !== this.props.highlightBulbIndex) {
        // A new image should be displayed (if the bulb has an image)
        let {images} = this.props.bulbs[nextProps.highlightBulbIndex];
        if (images) {
          nextState.isShowingBulbViewer = true;
          nextState.bulbImage = this.props.imageMap[images[0]].thumbnail;
        }
      }
    }
  }

  hideBulbViewer() {
    this.setState({
      isShowingBulbViewer: false,
    });
  }

  handleKeyDown(e) {
    if (e.key === "Escape") {
      this.hideBulbViewer();

      this.isBulbImageCooldown = true;
      setTimeout(() => this.isBulbImageCooldown = false,
          this.BULB_IMAGE_COOLDOWN);
    }
  }

  handleScroll(e) {
    let top = e.target.scrollTop,
        bottom = top + e.target.offsetHeight;

    if (bottom > this.state.scrollBottom - this.UPDATE_TRIGGER ||
        top < this.state.scrollTop + this.UPDATE_TRIGGER ||
        bottom === e.target.scrollHeight || top === 0) {

      this.setState({
        displayVersion: new Date().getTime(),
        scrollTop     : top - this.UPDATE_STEP,
        scrollBottom  : bottom + this.UPDATE_STEP
      });
    }
  }

  handleBulbClick(src) {
    if (!this.isBulbImageCooldown) {
      this.setState({
        isShowingBulbViewer: true,
        bulbImage          : src,
      });
    }
  }


  render() {
    return (
        <div
            className={`EntryView ${this.props.articles.length ? "" : "bulb-only"} ${this.props.bulbs.length ? "" : "article-only"}`}>
          <BulbImageView
              className={`${this.state.isShowingBulbViewer ? "show" : ""}`}
              src={this.state.bulbImage}
              onClickHide={this.hideBulbViewer}
          />
          <NoScrollArea padding="20px" backgroundColor="#eeeced">
            <div className="entry-list" ref="scrollArea">
              <EntryList
                  {...this.props}
                  scrollTop={this.state.scrollTop}
                  scrollBottom={this.state.scrollBottom}
                  version={this.state.displayVersion}
                  onLocationClick={this.props.onLocationClick}
                  onBulbClick={src => this.handleBulbClick(src)}
                  highlightBulbIndex={this.props.highlightBulbIndex}
              />
            </div>
          </NoScrollArea>
          { this.props.data.length === 0 ? (
              <div className="empty-prompt flex-center">
                Nothing can be found here. Maybe you would like to write
                something?
              </div>
          ) : null }
        </div>
    );
  }
}

