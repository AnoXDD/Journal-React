/**
 * Created by Anoxic on 042217.
 * The main list to show all the entries given
 */

import React, {Component} from "react";
import NoScrollArea from "./NoScrollArea";
import Button from "./Button";
import R from "./R";

export default class EntryList extends Component {

  /**
   * Stores the original positions and times of articles
   * @type {{}}
   */
  articles = {};

  constructor(props) {
    super(props);

    this.generateArticleList = this.generateArticleList.bind(this);
    this.generateBulbList = this.generateBulbList.bind(this);

    this.state = {
      articleMargin: {},
      bulbMargin   : {}
    }
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
        marginTop      : this.state.articleMargin[index] || "30px",
      },
    };
  }

  generateArticleList() {
    this.articles = [];
    let lastBottom = 0;

    return (
        <div className="article-list">
          <div className="flex-extend-inner-wrapper">
            {this.props.data.map((article, index) => {
              if (!(article.contentType)) {
                lastBottom += article.images ? 330 : 135;

                this.articles.push({
                  index : index,
                  bottom: lastBottom,
                  time  : article.time.created,
                  title : article.title,
                });

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
        articleMargin = {},
        adjustedArticle = 0;

    return (
        <div className="bulb-list">
          <div className="flex-extend-inner-wrapper">
            {this.props.data.map((bulb, index) => {
              if (bulb.contentType) {
                if (this.articles[nextArticleIndex].time > bulb.time.created) {
                  // The bulb above it is formed a group
                  // Adjust the top margin of the last article
                  if (currentBulbBottom > this.articles[nextArticleIndex].bottom + accumulatedArticleAdjustedTop) {
                    // The bottom of current bulb group is lower than the last
                    // article block
                    let adjusted = currentBulbBottom - (accumulatedArticleAdjustedTop + this.articles[nextArticleIndex].bottom) - 5 + 30 * (++adjustedArticle);
                    accumulatedArticleAdjustedTop += adjusted;
                    articleMargin[this.articles[nextArticleIndex].index] = adjusted + "px";
                  }

                  ++nextArticleIndex;
                }

                currentBulbBottom += 32;

                if (index === this.props.data.length - 1) {
                  this.state.articleMargin = articleMargin;
                }

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
              if (index === this.props.data.length - 1) {
                this.state.articleMargin = articleMargin;
              }

              return null;
            })}
          </div>
        </div>
    );
  }

  render() {

    console.log(R);

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