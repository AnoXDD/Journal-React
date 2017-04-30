/**
 * Created by Anoxic on 042917.
 * The main frame of the whole thing
 */

import React, {Component} from "react";

import Editor from './Editor';
import Calendar from "./Calendar";
import EntryView from "./EntryView";
import SearchBar from "./SearchBar";

import TestData from "./TestData";

export default class MainContent extends Component {

  TAG_PREDICTION_DICTIONARY = "journal";

  data = {};
  imageMap = {};

  year = new Date().getFullYear();

  constructor(props) {
    super(props);

    this.state = {
      data: TestData.data
    };

    this.data = this.state.data;
    this.year = 2016;
  }

  render() {
    return (
        <div className="MainContent">
          <nav className="sidebar"></nav>
          <main>
            <div className="flex-extend-inner-wrapper inner-main">
              <header>
                <div className="search-bar"><SearchBar/></div>
              </header>
              <div className="content">
                <div className="flex-extend-inner-wrapper inner-content">
                  <Calendar data={this.data}/>
                  <EntryView data={this.data} imageMap={this.imageMap}/>
                  <Editor tagPrediction={this.TAG_PREDICTION_DICTIONARY}/>
                </div>
              </div>
            </div>
          </main>
        </div>
    );
  }
}