/**
 * Created by Anoxic on 042217.
 * The main list to show all the entries given
 */

import React, {Component} from "react";
import NoScrollArea from "./NoScrollArea";
import Button from "./Button";
import Image from "./Image";
import R from "./R";

class BulbImageView extends Component {
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
                onClick={() => {window.open(this.props.src)}}
                src={`${this.props.src || ""}`}
            />
          </div>
        </div>
    );
  }
}

class ContentArticle extends Component {

  state = {
    image: ""
  };

  handleMouseMove(e, images) {
    let i = parseInt(Math.min((e.clientX - e.target.getBoundingClientRect().left) / e.target.offsetWidth,
            .999999999) * images.length, 10);

    this.setState({
      image: this.props.imageMap[images[i]] || `https://unsplash.it/300/300?image=${i}`
    });
  }

  render() {
    let {style, article, time} = this.props,
        articleProp = {
          className: `${this.props.className || ""}`,
          style    : style,
        };

    if (article.images) {
      articleProp.onMouseMove = (e) => this.handleMouseMove(e, article.images);
    }

    return (
        <article {...articleProp}>
          <Image src={this.state.image}/>
          <div className="text">
            <header>
              <div className="title">{article.title}</div>
              <div className="time">{time}</div>
            </header>
            <div className="details">
              {article.body}
            </div>
          </div>
          <Button className="dark">delete</Button>
        </article>
    );
  }
}

class EntryList extends Component {
  /**
   * Stores the original positions and times of articles and bulbs
   * @type {{}}
   */
  contentStyle = {};

  articleList = [];
  bulbList = [];

  currentVersion = 0;

  constructor(props) {
    super(props);

    this.generateArticleList = this.generateArticleList.bind(this);
    this.generateBulbList = this.generateBulbList.bind(this);
    this.updateContentStyle = this.updateContentStyle.bind(this);

    this.updateContentStyle(props);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.version !== this.currentVersion;
  }

  componentWillUpdate(nextProps) {
    this.updateContentStyle(nextProps);
  }

  /**
   * Return the correct state based on this.props
   */
  updateContentStyle(props) {
    this.contentStyle = {};
    this.bulbList = [];
    this.articleList = [];

    let {data} = props,
        articleHeight = 0,
        bulbHeight = 0;

    for (let content of data) {
      if (content.type === R.TYPE_BULB) {
        // Bulb
        this.bulbList.push(content);

        // Calculate the height
        let top = Math.max(articleHeight - R.BULB_HEIGHT_ORIGINAL,
            bulbHeight);
        this.contentStyle[content.time.created] = top;

        bulbHeight = top + R.BULB_HEIGHT;
      } else {
        // Article
        this.articleList.push(content);

        let currentHeight = content.images ? R.ARTICLE_IMAGE_HEIGHT : R.ARTICLE_NO_IMAGE_HEIGHT,
            top = Math.max(bulbHeight - (currentHeight - R.ARTICLE_MARGIN),
                articleHeight);
        this.contentStyle[content.time.created] = top;

        articleHeight = top + currentHeight;
      }
    }

    this.currentVersion = props.version;
    this.contentStyle.height = Math.max(articleHeight, bulbHeight);
  }

  /**
   * Generate a form list "Yesterday 12:34 - 12:56"
   */
  generateHumanFormTimeFromArticle(time) {
    var date = new Date(time.created || time.start),
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
        dateHeader = "Yesterday";
      } else {
        // Test for this week
        var firstWeekDay = firstDay.getDay(),
            yearWeek = Math.floor((yearDay - firstWeekDay) / 7),
            nowYearWeek = Math.floor((nowYearDay - firstWeekDay) / 7);
        dateHeader = "";
        switch (nowYearWeek - yearWeek) {
          case 1:
            // It was the last week
            dateHeader = "Last ";
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
    let background = "", className = "shadow";
    if (article.images && article.images.length) {
      background = `url('${this.props.imageMap[article.images[0]] || "https://unsplash.it/300/200/?random"}')`;
    } else {
      className += " no-image";
    }

    return {
      className: className,
      style    : {
        backgroundImage: background,
        top            : this.contentStyle[article.time.created],
      },
    };
  }

  generateArticleList() {
    return (
        <div className="article-list">
          <div className="flex-extend-inner-wrapper">
            {this.articleList.map(article => {
              return (
                  <ContentArticle
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

  generateBulbProp(bulb) {
    let top = this.contentStyle[bulb.time.created],
        prop = {
          className: top >= this.props.scrollTop && top <= this.props.scrollBottom ? "" : "hidden",
          style    : {top: top},
        };

    if (this.props.debug) {
      bulb.images = [undefined];

      let rand = (bulb.time.created / 1000) % 5;
      prop.onClick = () => {
        this.props.onBulbClick(bulb.images[0] || `https://unsplash.it/300/${200 + rand * 100}?image=${rand}`);
      };
    } else if (bulb.images) {

      prop.onClick = () => {
        this.props.onBulbClick(bulb.images[0]);
      };
    }

    return prop;
  }

  generateBulbList() {
    return (
        <div className="bulb-list"
             style={{height: `${this.contentStyle.height || 0}px`}}>
          <div className="flex-extend-inner-wrapper">
            {this.bulbList.map(bulb => {
              return (
                  <article key={`bulb-preview-${bulb.time.created}`}
                      {...this.generateBulbProp(bulb)}
                  >
                    <header className="shadow-light vertical-align">
                      <div className="time vertical-align-wrapper">
                        {this.generateHumanFormTimeFromArticle(bulb.time)}
                      </div>
                    </header>
                    <div className="details">{bulb.body}</div>
                  </article>
              )
            })}
          </div>
        </div>
    );
  }

  render() {
    return (
        <div className="entries">
          {this.generateArticleList()}
          <div className="timeline-wrapper">
                <span className="timeline"
                      style={{height: `${this.contentStyle.height || 0}px`}}/>
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
    if (nextProps.version > nextState.displayVersion) {
      nextState.displayVersion = nextProps.version;
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
        <div className="EntryView">
          <BulbImageView
              className={`${this.state.isShowingBulbViewer ? "show" : ""}`}
              src={this.state.bulbImage}
              onClickHide={this.hideBulbViewer}
          />
          <NoScrollArea padding="20px">
            <div className="entry-list" ref="scrollArea">
              <EntryList
                  {...this.props}
                  scrollTop={this.state.scrollTop}
                  scrollBottom={this.state.scrollBottom}
                  version={this.state.displayVersion}
                  onBulbClick={src => this.handleBulbClick(src)}
              />
            </div>
          </NoScrollArea>
        </div>
    );
  }
}

