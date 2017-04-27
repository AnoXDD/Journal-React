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
  BULB_MARGIN_TOP = 5;
  BULB_HEIGHT = this.BULB_HEIGHT_ORIGINAL + this.BULB_MARGIN_TOP;

  /**
   * Stores the original positions and times of articles
   * @type {{}}
   */
  articles = {};
  articleMargin = [];
  articleList = [];

  bulbMargin = [];
  bulbList = [];

  constructor(props) {
    super(props);

    this.generateArticleList = this.generateArticleList.bind(this);
    this.generateBulbList = this.generateBulbList.bind(this);
    this.updateContents = this.updateContents.bind(this);

    this.updateContents(props);
  }

  componentWillUpdate(nextProps, nextState) {
    this.updateContents(nextProps);
  }

  /**
   * Return the correct state based on this.props
   */
  updateContents(props) {
    var {data} = props;

    this.bulbList = [];
    this.bulbMargin = {};
    this.articleList = [];
    this.articleMargin = {};
    this.articles = [];

    let nextOlderArticleIndex = 0,
        adjustedArticleTop = 0,
        adjustedBulbTop = 0,
        adjustedArticles = 0,
        adjustedBulbs = 0,
        lastBulbLeadIndex = 0,
        currentBulbBottom = -this.BULB_MARGIN_TOP,
        currentArticleBottom = -this.ARTICLE_MARGIN_TOP;

    for (let index = 0; index < data.length; ++index) {
      let content = data[index];

      if (content.contentType) {
        // Bulb
        this.bulbList.push(content);

        if (this.articles[nextOlderArticleIndex] && this.articles[nextOlderArticleIndex].time > content.time.created) {
          // The bulbs above it form a group
          let nextOlderArticle = this.articles[nextOlderArticleIndex],
              adjustedBulbBottom = currentBulbBottom + adjustedBulbTop,
              adjustedArticleBottom = nextOlderArticle.bottom + adjustedArticleTop;

          // Adjust the top margin of the last article
          if (adjustedBulbBottom > adjustedArticleBottom) {
            // The bottom of current bulb group is lower than the bottom of the
            // last article block
            let adjusted = adjustedBulbBottom - adjustedArticleBottom + this.ARTICLE_MARGIN_TOP * (adjustedArticles++);

            adjustedArticleTop += adjusted;
            this.articleMargin[nextOlderArticle.propIndex] = adjusted + "px";

          } else if (adjustedBulbBottom - this.BULB_HEIGHT <
              adjustedArticleBottom - nextOlderArticle.height) {
            // The bottom of the current bulb group is higher than the top of
            // the last article block

            let adjusted = adjustedArticleBottom - nextOlderArticle.height - (adjustedBulbBottom - this.BULB_HEIGHT) + this.BULB_MARGIN_TOP * (adjustedBulbs++);

            adjustedBulbTop += adjusted;
            this.bulbMargin[lastBulbLeadIndex] = adjusted + "px";
          } else {
            // ++adjustedBulbs;
            this.bulbMargin[lastBulbLeadIndex] = "0px";
          }

          ++nextOlderArticleIndex;
          lastBulbLeadIndex = this.bulbList.length - 1;
        }

        currentBulbBottom += this.BULB_HEIGHT;
      } else {
        // Journal
        this.articleList.push(content);

        let height = content.images ? this.ARTICLE_IMAGE_HEIGHT : this.ARTICLE_NO_IMAGE_HEIGHT;
        currentArticleBottom += height;

        this.articles.push({
          propIndex: index,
          height   : height,
          bottom   : currentArticleBottom,
          time     : content.time.created,
          title    : content.title, // todo remove this line for release
        });

      }
    }
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
        marginTop      : this.articleMargin[this.articles[index].propIndex] || "30px",
      },
    };
  }

  generateArticleList() {
    return (
        <div className="article-list">
          <div className="flex-extend-inner-wrapper">
            {this.articleList.map((article, index) => {
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
            })}
          </div>
        </div>
    );
  }

  generateBulbStyle(index) {
    if (this.bulbMargin[index]) {
      return {
        className: "bulb-first",
        style    : {marginTop: this.bulbMargin[index]}
      };
    }

    return {};
  }

  generateBulbList() {
    return (
        <div className="bulb-list">
          <div className="flex-extend-inner-wrapper">
            {this.bulbList.map((bulb, index) => {
              return (
                  <article key={`bulb-preview-${bulb.time.created}`}
                      {...this.generateBulbStyle(index)}
                  >
                    <header className="shadow-light">
                      <div className="time">
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