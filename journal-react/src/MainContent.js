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

export default class MainContent extends Component {

  SEARCH_BAR_TAGS = ["tags", "months", "attachments"];

  data = {};
  imageMap = {};

  year = new Date().getFullYear();

  constructor(props) {
    super(props);

    this.state = {
      data: TestData.data,
      year: 2016,
    };

    /**
     * `this.data` stores all the data that can be displayed, while
     * `this.state.data` stores the data that are actually displayed
     */
    this.data = {2016: this.state.data};

    this.handleChangeCriteria = this.handleChangeCriteria.bind(this);
  }

  handleChangeCriteria(c) {
    if (!c.keywords.length) {
      // Empty
      this.setState({data: this.data[this.state.year]});
    } else {
      this.setState({
        data: this.data[this.state.year].filter(d => {
          // First, type
          if ((typeof c.hasArticle !== "undefined" && !c.hasArticle && !c.contentType) ||
              (typeof c.hasBulb !== "undefined" && !c.hasBulb && c.contentType)) {
            return false;
          }

          // Second, keywords
          if (c.keywords && c.keywords.findIndex(k => {
                return (d.title && d.title.indexOf(k) !== -1) ||
                    d.text.body.indexOf(k) !== -1;
              }) === -1) {
            return false;
          }

          // Time
          if (c.months && c.months.findIndex(m => {
                return new Date(d.time.created).getMonth() === m;
              }) === -1) {
            return false;
          }

          // Tag
          if (c.tags && d.tags) {
            let tags = d.tags.split("|");
            if (c.tags.findIndex(t => {
                  return tags.indexOf(t) !== -1;
                }) === -1) {
              return false;
            }
          }

          // Attachments
          if (c.attachments) {
            if (c.attachments.findIndex(a => {
                  return typeof d[a] !== "undefined";
                }) === -1) {
              return false;
            }
          }

          return true;
        })
      });
    }
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
              <Button className="dark indent"
                      text="calendar">date_range</Button>
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
                              data={this.state.data}/>
                  </div>
                  <EntryView data={this.state.data}
                             imageMap={this.imageMap}
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