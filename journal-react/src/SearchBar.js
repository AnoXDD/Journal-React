/**
 * Created by Anoxic on 042917.
 * A search bar to be used on the top
 */

import React, {Component} from "react";
import Button from "./Button";
import PredictionInputs from "./PredictionInputs";

import Ink from "react-ink";

class Options extends Component {

  state = {};

  constructor(props) {
    super(props);

    let {icons, options} = this.props;
    this.options = options.split(" ");
    this.icons = icons ? icons.split(" ") : [];
  }

  componentDidUpdate() {
    let selected = [],
        states = Object.keys(this.state);

    for (let state of states) {
      if (this.state[state]) {
        selected.push(state);
      }
    }

    this.props.onChange(selected);
  }

  handleClick(option) {
    let state = {};
    state[option] = !this.state[option];
    this.setState(state);
  }

  render() {
    return (
        <div className={`Options ${this.icons.length ? "" : "text"}`}>
          { this.options.map((option, index) =>
              <a
                  key={`option-${option}`}
                  className={`option ${this.state[option] ? "selected" : ""}`}
                  onClick={() => this.handleClick(option)}>
                <Ink/>
                <div className="vertical-align icon-wrapper">
                  <i className="material-icons vertical-align-wrapper">
                    {this.icons[index] || ""}
                  </i>
                </div>
                <div className="vertical-align text-wrapper">
                  <span className="vertical-align-wrapper btn-text">
                            {option}
                  </span>
                </div>
              </a>
          ) }
        </div>
    );
  }
}

class SearchBarTitle extends Component {
  render() {
    return (
        <div className="vertical-align title">
          <div className="vertical-align-wrapper">{this.props.children}</div>
        </div>
    );
  }
}

export default class SearchBar extends Component {

  state = {
    value   : '',
    tags    : [],
    keywords: [],
  };

  render() {
    return (
        <div className="SearchBar">
          <div className="vertical-align search-bar-wrapper">
            <Button className="vertical-align-wrapper dark"
                    text="search">search</Button>
          </div>
          <div className="form">
            <div className="form-wrapper">
              <div className="form-col">
                <SearchBarTitle>Keyword</SearchBarTitle>
                <PredictionInputs
                    className={`tag white-background new-tag-wrapper`}
                    tagPrediction={""}
                    tags={this.state.keywords}
                    onChange={keywords => this.setState({keywords: keywords})}
                />
              </div>
              <div className="form-col">
                <SearchBarTitle>Tags</SearchBarTitle>
                <PredictionInputs
                    className={`tag white-background new-tag-wrapper`}
                    tagPrediction={this.props.tagPrediction}
                    tags={this.state.tags}
                    onChange={tags => this.setState({tags: tags})}
                />
              </div>
              <div className="form-col">
                <SearchBarTitle>Time</SearchBarTitle>
                <Options
                    options="Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec"
                    onChange={console.log}/>
              </div>
              <div className="form-col">
                <SearchBarTitle>Type</SearchBarTitle>
                <Options options="Article Bulb"
                         icons="description lightbulb_outline"
                         onChange={console.log}/>
              </div>
              <div className="form-col">
                <SearchBarTitle>Attachments</SearchBarTitle>
                <Options options="photos musics movies links others"
                         icons="photo_library library_music movie link more_horiz"
                         onChange={console.log}/>
              </div>
            </div>
          </div>
        </div>
    );
  }
}
