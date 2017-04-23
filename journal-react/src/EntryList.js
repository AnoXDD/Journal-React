/**
 * Created by Anoxic on 042217.
 * The main list to show all the entries given
 */

import React, {Component} from "react";
import NoScrollArea from "./NoScrollArea";
import Button from "./Button";
import R from "./R";

export default class EntryList extends Component {

  ARTICLE_MARGIN_TOP = 30;
  ARTICLE_IMAGE_HEIGHT = 300 + this.ARTICLE_MARGIN_TOP;
  ARTICLE_NO_IMAGE_HEIGHT = 105 + this.ARTICLE_MARGIN_TOP;
  BULB_HEIGHT_ORIGINAL = 27;
  BULB_HEIGHT_MARGIN = 5;
  BULB_HEIGHT = this.BULB_HEIGHT_ORIGINAL + this.BULB_HEIGHT_MARGIN;

  /**
   * Stores the original positions and times of articles
   * @type {{}}
   */
  articles = {};
  articleMargin = [];

  constructor(props) {
    super(props);

    this.generateArticleList = this.generateArticleList.bind(this);
    this.generateBulbList = this.generateBulbList.bind(this);

    this.state = {
      articleMargin: {},
      bulbMargin   : {}
    }
  }

  componentWillUpdate(nextProps, nextState) {
    // nextState.articleMargin = this.articleMargin;
  }

  /**
   * Generate a form list "Yesterday 12:34 - 12:56"
   */
  generateHumanFormTimeFromArticle(time) {
    var date = new Date(time.start || time.created),
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

  generateArticleStyle(article, index) {
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
        marginTop      : this.articleMargin[index] || "30px",
      },
    };
  }

  generateArticleList() {
    return (
        <div className="article-list">
          <div className="flex-extend-inner-wrapper">
            {this.props.data.map((article, index) => {
              if (!(article.contentType)) {
                return (
                    <article
                        className="shadow"
                        key={`article-preview-${article.time.created}`}
                        {...this.generateArticleStyle(article, index)}
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
              }
              return null;
            })}
          </div>
        </div>
    );
  }

  generateBulb(bulb, index) {

  }

  generateBulbList() {
    let nextArticleIndex = 0,
        currentBulbBottom = 0,
        accumulatedArticleAdjustedTop = 0,
        adjustedArticle = 0,
        lastBottom = 0;

    this.articleMargin = {};
    this.articles = [];

    return (
        <div className="bulb-list">
          <div className="flex-extend-inner-wrapper">
            {this.props.data.map((bulb, index) => {
              if (bulb.contentType) {
                if (this.articles[nextArticleIndex] && this.articles[nextArticleIndex].time > bulb.time.created) {
                  // The bulb above it is formed a group
                  // Adjust the top margin of the last article
                  if (currentBulbBottom > this.articles[nextArticleIndex].bottom + accumulatedArticleAdjustedTop) {
                    // The bottom of current bulb group is lower than the last
                    // article block
                    let adjusted = currentBulbBottom - (accumulatedArticleAdjustedTop + this.articles[nextArticleIndex].bottom) - this.BULB_HEIGHT_MARGIN + this.ARTICLE_MARGIN_TOP * (++adjustedArticle);
                    accumulatedArticleAdjustedTop += adjusted;
                    this.articleMargin[this.articles[nextArticleIndex].index] = adjusted + "px";
                  }

                  ++nextArticleIndex;
                }

                currentBulbBottom += this.BULB_HEIGHT;

                return (
                    <article key={`bulb-preview-${bulb.time.created}`}>
                      <header className="shadow-light">
                        <div className="time">
                          {this.generateHumanFormTimeFromArticle(bulb.time)}
                        </div>
                      </header>
                      <div className="details">{bulb.text.body}</div>
                    </article>
                )
              }

              // This is an article
              let article = bulb;
              lastBottom += article.images ? this.ARTICLE_IMAGE_HEIGHT : this.ARTICLE_NO_IMAGE_HEIGHT;

              this.articles.push({
                index : index,
                bottom: lastBottom,
                time  : article.time.created,
              });

              return null;
            })}
          </div>
        </div>
    );
  }

  render() {
    // Do this to process the article height
    let bulbList = this.generateBulbList();

    return (
        <div className="EntryList">
          <NoScrollArea padding="20px">
            <div className="entries">
              {this.generateArticleList()}
              {this.generateBulbList()}
            </div>
          </NoScrollArea>
        </div>
    );
  }
}