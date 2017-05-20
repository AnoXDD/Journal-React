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
import BulbMap from "./BulbMap";
import Chart from "./Chart";

import R from "./R";

import TestData from "./TestData";

function upgradeDataFromVersion2To3(oldData) {
  let data = [],
      list = ["video", "voice"];

  for (let d of oldData) {
    let entry = {};
    entry.type = d.contentType === 1 ? R.TYPE_BULB : R.TYPE_ARTICLE;
    entry.time = Object.assign({}, d.time);
    // entry.body = d.text.body;
    // for debug here
    entry.body = d.text.body.replace(/[a-z0-9]/gi,
        Math.random().toString(36).charAt(3));

    if (d.images && d.images.length) {
      let images = [];
      for (let image of d.images) {
        images.push(image.fileName);
      }

      entry.images = images;
    }

    if (d.place) {
      entry.place = Object.assign({}, d.place);
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
        entry.links = Object.assign({}, d.weblink);
      }

      if (d.book && d.book.length) {
        entry.book = Object.assign({}, d.book);
      }

      if (d.video || d.voice) {
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
  TAB = {
    NO_CHANGE: 0,
    LIST     : 1 << 1,
    EDITOR   : 1 << 2,
    HISTORY  : 1 << 3,
    STATS    : 1 << 4,
    SETTINGS : 1 << 5,
  };

  state = {
    data   : upgradeDataFromVersion2To3(TestData.data),
    year   : 2016,
    version: 0,

    isDisplaying        : this.TAB.LIST,
    isDisplayingCalendar: false,
    isDisplayingMapView : true,

    // Use | to connect them later
    enabledTabs: this.TAB.LIST | this.TAB.STATS,

    editArticleIndex: undefined,
  };

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
  highlightBulbIndex = -1;

  editorVersion = 0;

  /* Press escape anywhere to return to this tab */
  escapeToReturn = this.TAB.NO_CHANGE;


  constructor(props) {
    super(props);

    /**
     * `this.data` stores all the data that can be displayed, while
     * `this.state.data` stores the data that are actually displayed
     */
    this.data = {2016: this.state.data};

    this.updateContentStyle = this.updateContentStyle.bind(this);

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChangeCriteria = this.handleChangeCriteria.bind(this);
    this.handleCalendarClick = this.handleCalendarClick.bind(this);
    this.handleArticleClick = this.handleArticleClick.bind(this);
    this.handleBulbClick = this.handleBulbClick.bind(this);
    this.handleCreateArticle = this.handleCreateArticle.bind(this);
    this.handlePromptCancel = this.handlePromptCancel.bind(this);
    this.toggleIsDisplayingCalendar = this.toggleIsDisplayingCalendar.bind(this);
    this.toggleIsDisplayingMapView = this.toggleIsDisplayingMapView.bind(this);

    this.updateContentStyle(this.state.data);
  }

  componentWillUpdate(nextProps, nextState) {
    this.updateContentStyle(nextState.data);
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }

  handleKeyDown(e) {
    if (e.key === "Escape") {
      this.handleViewChange(this.escapeToReturn);
    }

    this.escapeToReturn = this.TAB.NO_CHANGE;
  }

  handleCalendarClick(top) {
    this.scrollTop = top;

    this.setState({
      version: new Date().getTime(),
    });
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

  handleViewChange(newView) {
    if (newView && newView !== this.TAB.NO_CHANGE) {
      this.setState({
        isDisplaying: newView,
      });
    }
  }

  handlePromptCancel(e) {
    // Set to zero to tell the editor that that data is not the latest
    this.editorVersion = 0;
    this.handleViewChange(this.TAB.LIST);
  }

  handleCreateArticle() {
    this.editorVersion = new Date().getTime();
    this.setState({
      editArticleIndex: -1,
      enabledTabs     : this.state.enabledTabs | this.TAB.EDITOR,
    }, this.handleViewChange(this.TAB.EDITOR));
  }

  handleArticleClick(i) {
    this.editorVersion = new Date().getTime();
    this.escapeToReturn = this.TAB.LIST;
    this.setState({
      editArticleIndex: i,
      enabledTabs     : this.state.enabledTabs | this.TAB.EDITOR,
    }, this.handleViewChange(this.TAB.EDITOR));
  }

  handleBulbClick(top, index) {
    this.highlightBulbIndex = index;
    this.handleCalendarClick(top);
  }

  toggleIsDisplayingCalendar() {
    this.setState({
      isDisplayingCalendar: !this.state.isDisplayingCalendar,
    });
  }

  toggleIsDisplayingMapView() {
    this.setState({
      isDisplayingMapView: !this.state.isDisplayingMapView,
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
    const BUTTONS = [{
      text: "LIST",
      icon: "list"
    }, {
      text     : "calendar",
      icon     : "date_range",
      indent   : "indent",
      className: `dark ${this.state.isDisplayingCalendar && this.state.isDisplaying === this.TAB.LIST ? "active" : ""}`,
      onClick  : this.toggleIsDisplayingCalendar,
    }, {
      text     : "map view",
      icon     : "map",
      indent   : "indent",
      className: `dark ${this.state.isDisplayingMapView && this.state.isDisplaying === this.TAB.LIST ? "active" : ""}`,
      onClick  : this.toggleIsDisplayingMapView,
    }, {
      text: "EDITOR",
      icon: "edit"
    }, {
      text: "HISTORY",
      icon: "restore"
    }, {
      text: "STATS",
      icon: "show_chart"
    }, {
      text: "SETTINGS",
      icon: "settings"
    }];

    return (
        <div className="MainContent">
          <aside className="sidebar">
            <div className="create-btn">
              <Button className="accent" text="create"
                      onClick={this.handleCreateArticle}>add</Button>
            </div>
            <div className="other-btn">
              {BUTTONS.map(b =>
                  <Button key={b.text}
                          className={`${(this.state.enabledTabs & this.TAB[b.text]) || b.indent ? "" : "disabled" } ${b.className || `dark ${this.state.isDisplaying === this.TAB[b.text] ? "active" : ""}`} ${b.indent || ""}`}
                          text={b.text}
                          onClick={b.onClick || (() => this.handleViewChange(this.TAB[b.text]))}
                  >{b.icon}</Button>
              )}
            </div>
          </aside>
          <main>
            <div
                className={`flex-extend-inner-wrapper inner-main ${this.state.isDisplaying === this.TAB.LIST ? "" : "hidden"}`}>
              <header className="main-header flex-center">
                <SearchBar tagPrediction={R.TAG_PREDICTION_DICTIONARY}
                           onChange={this.handleChangeCriteria}
                />
                <Button
                    className="dark"
                >navigate_before</Button>
                <span className="year">Year: {this.year}</span>
                <Button
                    className="dark"
                    disabled={this.year === new Date().getFullYear()}>
                  navigate_next
                </Button>
              </header>
              <div className="content">
                <div
                    className="flex-extend-inner-wrapper inner-content list-view">
                  <div
                      className={`calendar-view ${this.state.isDisplayingCalendar ? "" : "hidden"}`}
                  >
                    <div className="calendar-padding"></div>
                    <div className="calendar-parent">
                      <div className="flex-extend-inner-wrapper">
                        <Calendar
                            version={this.state.version}
                            contentStyle={this.contentStyle}
                            onBlockClick={this.handleCalendarClick}
                            data={this.state.data}/>
                      </div>
                    </div>
                  </div>
                  <EntryView
                      version={this.state.version}
                      data={this.state.data}
                      imageMap={this.imageMap}
                      contentStyle={this.contentStyle}
                      scrollTop={this.scrollTop}
                      articles={this.articleList}
                      bulbs={this.bulbList}
                      highlightBulbIndex={this.highlightBulbIndex}
                      onArticleClick={this.handleArticleClick}
                      debug={true}
                  />
                  <div
                      className={`bulb-map-view ${this.state.isDisplayingMapView ? "" : "hidden"}`}>
                    <BulbMap
                        data={this.bulbList}
                        contentStyle={this.contentStyle}
                        onBulbClick={this.handleBulbClick}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
                className={`flex-extend-inner-wrapper editor-view ${this.state.isDisplaying === this.TAB.EDITOR ? "" : "hidden"}`}>
              <Editor {...this.articleList[this.state.editArticleIndex]}
                  onPromptCancel={this.handlePromptCancel}
                  imageMap={this.imageMap}
                  version={this.editorVersion}
                  tagPrediction={R.TAG_PREDICTION_DICTIONARY}/>
            </div>
            <div
                className={`flex-extend-inner-wrapper stats-view ${this.state.isDisplaying === this.TAB.STATS ? "" : "hidden"}`}>
              <Chart data={this.state.data}/>
            </div>
          </main>
        </div>
    );
  }
}