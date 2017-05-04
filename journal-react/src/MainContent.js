/**
 * Created by Anoxic on 042917.
 * The main frame of the whole thing
 */

import React, {Component} from "react";

import Button from "./Button";
import Editor from './Editor';
import Calendar from "./Calendar";
import EntryView from "./EntryView";
import SearchBar from "./SearchBar";

import R from "./R";

import TestData from "./TestData";

function upgradeDataFromVersion2To3(oldData) {
  let data = [],
      list = ["place", "video", "voice"];

  for (let d of oldData) {
    let entry = {};
    entry.type = d.contentType === 1 ? R.TYPE_BULB : R.TYPE_ARTICLE;
    entry.time = Object.assign({}, d.time);
    // entry.body = d.text.body;
    // for debug here
    entry.body = d.text.body.replace(/[a-z]/gi,
        Math.random().toString(36).charAt(3));

    if (d.images) {
      let images = [];
      for (let image of d.images) {
        images.push(image.fileName);
      }

      entry.images = images;
    }

    if (entry.type === R.TYPE_ARTICLE) {
      // entry.title = d.title;
      // for debug here
      entry.title = d.title.replace(/[a-z]/gi,
          Math.random().toString(36).charAt(3));
      entry.tags = d.tags.split("|");

      if (d.music && d.music.length) {
        entry.music = Object.assign({}, d.music);
      }

      if (d.movie && d.movie.length) {
        entry.movie = Object.assign({}, d.movie);
      }

      if (d.weblink && d.weblink.length) {
        entry.link = Object.assign({}, d.weblink);
      }

      if (d.book && d.book.length) {
        entry.book = Object.assign({}, d.book);
      }

      if (d.place || d.video || d.voice) {
        let others = {};
        for (let l of list) {
          if (d[l] && d[l].length) {
            others[l] = Object.assign({}, d[l]);
          }
        }

        if (Object.keys(others).length) {
          entry.others = others;
        }
      }
    }

    data.push(entry);
  }

  return data;
}

export default class MainContent extends Component {

  SEARCH_BAR_TAGS = ["tags", "months", "attachments"];

  data = {};
  imageMap = {};

  year = new Date().getFullYear();

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
      data   : upgradeDataFromVersion2To3(TestData.data),
      year   : 2016,
      version: 0,

      isDisplayingCalendar: true,
      isDiaplayingMapView : false,
    };

    /**
     * `this.data` stores all the data that can be displayed, while
     * `this.state.data` stores the data that are actually displayed
     */
    this.data = {2016: this.state.data};

    this.updateContentStyle = this.updateContentStyle.bind(this);
    this.handleChangeCriteria = this.handleChangeCriteria.bind(this);
    this.toggleIsDisplayingCalendar = this.toggleIsDisplayingCalendar.bind(this);

    this.updateContentStyle(this.state.data);
  }

  componentWillUpdate(nextProps, nextState) {
    this.updateContentStyle(nextState.data);
  }

  handleChangeCriteria(c) {
    if (c.simple && !c.keywords.length) {
      // Empty
      this.setState({
        data   : this.data[this.state.year],
        version: new Date().getTime(),
      });
    } else {
      let newData = this.data[this.state.year].filter(d => {
        // First, type
        if (!c.simple && ((!c.hasArticle && d.type === R.TYPE_ARTICLE) ||
            (!c.hasBulb && d.type === R.TYPE_BULB))) {
          return false;
        }

        // Second, keywords
        if (c.keywords && c.keywords.length && c.keywords.findIndex(k => {
              return (d.title && d.title.indexOf(k) !== -1) ||
                  d.body.indexOf(k) !== -1;
            }) === -1) {
          return false;
        }

        // Time
        if (c.months && c.months.length && c.months.findIndex(m => {
              return new Date(d.time.created).getMonth() === m;
            }) === -1) {
          return false;
        }

        // Tag
        if (c.tags && c.tags.length && d.tags) {
          if (c.tags.findIndex(t => {
                return d.tags.indexOf(t) !== -1;
              }) === -1) {
            return false;
          }
        }

        // Attachments
        if (c.attachments && c.attachments.length && c.attachments.findIndex(
                a => {
                  return typeof d[a] !== "undefined";
                }) === -1) {
          return false;
        }

        return true;
      })

      this.setState({
        data   : newData,
        version: new Date().getTime(),
      });
    }
  }

  toggleIsDisplayingCalendar() {
    this.setState({
      isDisplayingCalendar: !this.state.isDisplayingCalendar,
    });
  }

  toggleIsDisplayingMapView() {
    this.setState({
      isDisplayingMapView: !this.state.isDiaplayingMapView,
    });
  }

  /**
   * Return the correct state based on this.props
   */
  updateContentStyle(data) {
    this.contentStyle = {};
    this.bulbList = [];
    this.articleList = [];

    let articleHeight = 0,
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

    this.contentStyle.height = Math.max(articleHeight, bulbHeight);
  }

  render() {
    return (
        <div className="MainContent">
          <nav className="sidebar">
            <div className="create-btn">
              <Button className="accent" text="create">add</Button>
            </div>
            <div className="other-btn">
              <Button className="dark" text="list">list</Button>
              <Button
                  className={`dark indent ${this.state.isDisplayingCalendar ? "active" : ""}`}
                  text="calendar"
                  onClick={this.toggleIsDisplayingCalendar}
              >date_range</Button>
              <Button className="dark indent" text="map view">map</Button>
              <Button className="dark" text="editor">edit</Button>
              <Button className="dark" text="History">restore</Button>
              <Button className="dark" text="stats">show_chart</Button>
              <Button className="dark" text="settings">settings</Button>
            </div>
          </nav>
          <main>
            <div className="flex-extend-inner-wrapper inner-main">
              <header className="main-header">
                <SearchBar tagPrediction={R.TAG_PREDICTION_DICTIONARY}
                           onChange={this.handleChangeCriteria}
                />
              </header>
              <div className="content">
                <div className="flex-extend-inner-wrapper inner-content">
                  <div className="vertical-align">
                    <Calendar className="vertical-align-wrapper"
                              version={this.state.version}
                              hidden={!this.state.isDisplayingCalendar}
                              data={this.state.data}/>
                  </div>
                  <EntryView
                      version={this.state.version}
                      data={this.state.data}
                      imageMap={this.imageMap}
                      contentStyle={this.contentStyle}
                      articles={this.articleList}
                      bulbs={this.bulbList}
                      debug={true}/>
                  <Editor tagPrediction={R.TAG_PREDICTION_DICTIONARY}/>
                </div>
              </div>
            </div>
          </main>
        </div>
    );
  }
}