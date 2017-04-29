/**
 * Created by Anoxic on 042217.
 * The main list to show all the entries given
 */

import React, {Component} from "react";
import NoScrollArea from "./NoScrollArea";
import Button from "./Button";
import R from "./R";

export default class EntryList extends Component {

  ARTICLE_MARGIN = 30;
  ARTICLE_IMAGE_HEIGHT = 300 + this.ARTICLE_MARGIN;
  ARTICLE_NO_IMAGE_HEIGHT = 105 + this.ARTICLE_MARGIN;
  BULB_HEIGHT_ORIGINAL = 27;
  BULB_MARGIN_TOP = 5;
  BULB_HEIGHT = this.BULB_HEIGHT_ORIGINAL + this.BULB_MARGIN_TOP;

  /**
   * Stores the original positions and times of articles and bulbs
   * @type {{}}
   */
  contentStyle = {};

  articleList = [];
  bulbList = [];

  constructor(props) {
    super(props);

    this.state = {
      bulbImage          : "",
      isShowingBulbViewer: "",
    };

    this.generateArticleList = this.generateArticleList.bind(this);
    this.generateBulbList = this.generateBulbList.bind(this);
    this.updateContentStyle = this.updateContentStyle.bind(this);

    this.updateContentStyle(props);
  }

  componentWillUpdate(nextProps, nextState) {
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
      if (content.contentType) {
        // Bulb
        this.bulbList.push(content);

        // Calculate the height
        let top = Math.max(articleHeight - this.BULB_HEIGHT_ORIGINAL,
            bulbHeight);
        this.contentStyle[content.time.created] = top;

        bulbHeight = top + this.BULB_HEIGHT;
      } else {
        // Article
        this.articleList.push(content);

        let currentHeight = content.images ? this.ARTICLE_IMAGE_HEIGHT : this.ARTICLE_NO_IMAGE_HEIGHT,
            top = Math.max(bulbHeight - (currentHeight - this.ARTICLE_MARGIN),
                articleHeight);
        this.contentStyle[content.time.created] = top;

        articleHeight = top + currentHeight;
      }
    }

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
            // eslint-ignore-next-line
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
    if (article.images) {
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
                  <article
                      className="shadow"
                      key={`article-preview-${article.time.created}`}
                      {...this.generateArticleStyle(article)}
                  >
                    <div className="text">
                      <header>
                        <div className="title">{article.title}</div>
                        <div className="time">
                          {this.generateHumanFormTimeFromArticle(article.time)}
                        </div>
                      </header>
                      <div className="details">
                        {article.text.body}
                      </div>
                    </div>
                    <Button className="dark">delete</Button>
                  </article>
              );
            })}
          </div>
        </div>
    );
  }

  generateBulbProp(bulb) {
    let prop = {
      style: {top: this.contentStyle[bulb.time.created]},
    };

    // debug only
    bulb.images = [undefined];

    if (bulb.images) {
      prop.onMouseOver = () => {
        this.setState({
          bulbImage: bulb.images[0] || `https://unsplash.it/500/${200 + parseInt(
              Math.random() * 3) * 100}/?random`
        });
      };

      prop.onMouseLeave = () => {
        this.setState({bulbImage: ""});
      };
    }

    return prop;
  }

  generateBulbList() {
    let mouseEvents = {
      onMouseOver : () => this.setState({isShowingBulbViewer: true}),
      onMouseLeave: () => this.setState({isShowingBulbViewer: false}),
    }

    return (
        <div className="bulb-list" {...mouseEvents}
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
                    <div className="details">{bulb.text.body}</div>
                  </article>
              )
            })}
          </div>
        </div>
    );
  }

  render() {
    return (
        <div className="EntryList debug">
          <NoScrollArea padding="20px">
            <div className="entries">
              <div
                  className={`bulb-image-viewer ${this.state.isShowingBulbViewer ? "" : "hidden"}`}>
                <div className="bulb-image-viewer-wrapper">
                  <img className="center" src={`${this.state.bulbImage || ""}`}
                       alt=""/>
                </div>
              </div>
              {this.generateArticleList()}
              <div className="timeline-wrapper">
                <span className="timeline"
                      style={{height: `${this.contentStyle.height || 0}px`}}/>
              </div>
              {this.generateBulbList()}
            </div>
          </NoScrollArea>
        </div>
    );
  }
}