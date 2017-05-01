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
          <nav className="sidebar">
            <div className="create-btn">
              <Button className="accent" text="create">add</Button>
            </div>
            <Button className="dark" text="list">list</Button>
            <Button className="dark indent" text="calendar">event</Button>
            <Button className="dark indent" text="map view">map</Button>
            <Button className="dark" text="editor">edit</Button>
            <Button className="dark" text="History">restore</Button>
            <Button className="dark" text="stats">show_chart</Button>
            <Button className="dark" text="settings">settings</Button>
          </nav>
          <main>
            <div className="flex-extend-inner-wrapper inner-main">
              <header>
                <div className="search-bar"><SearchBar/></div>
              </header>
              <div className="content">
                <div className="flex-extend-inner-wrapper inner-content">
                  <div className="vertical-align">
                    <Calendar className="vertical-align-wrapper"
                              data={this.data}/>
                  </div>
                  <EntryView data={this.data} imageMap={this.imageMap}
                             debug={true}/>
                  <Editor tagPrediction={this.TAG_PREDICTION_DICTIONARY}/>
                </div>
              </div>
            </div>
          </main>
        </div>
    );
  }
}