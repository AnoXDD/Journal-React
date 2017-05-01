/**
 * Created by Anoxic on 042917.
 * A search bar to be used on the top
 */

import React, {Component} from "react";
import Button from "./Button";
import Toggle from "./Toggle";
import PredictionInputs from "./PredictionInputs";
import R from "./R";

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

  months = [];
  types = [];
  attachments = [];

  state = {
    value           : '',
    tags            : [],
    keywords        : [],
    isAdvancedSearch: false,
  };

  constructor(props) {
    super(props);

    this.toggleIsAdvancedSearch = this.toggleIsAdvancedSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  toggleIsAdvancedSearch() {
    this.setState({
      isAdvancedSearch: !this.state.isAdvancedSearch,
    });
  }

  clearSearch() {
    this.setState({
      value: "",
      tags: [],
      keywords:[],
    })
  }

  handleSubmit() {
    for (let d of this.types) {
      if (d === "Article") {
        var hasArticle = true;
      }
      if (d === "Bulb") {
        var hasBulb = true;
      }
    }

    let months = [];
    for (let month of this.months) {
      let index = R.month.indexOf(month);

      if (index !== -1) {
        months.push(index);
      }
    }

    this.props.onChange({
      hasArticle : !!hasArticle,
      hasBulb    : !!hasBulb,
      attachments: this.attachments,
      months     : months,
      keywords   : this.state.keywords,
      tags       : this.state.tags,
    });
  }

  render() {
    return (
        <div className="SearchBar">
          <div className="flex-center search-bar-wrapper">
            <input className="keyword normal underlined"/>
            <Button className="dark"
                    onClick={this.clearSearch}
            >clear</Button>
            <Toggle firstIcon="expand_more" secondIcon="expand_less"
                    className="dark"
                    onClick={this.toggleIsAdvancedSearch}
                    isChanging={this.state.isAdvancedSearch}
            />
            <Button className="dark"
                    text="search"
                    onClick={this.handleSubmit}
            >search</Button>
          </div>
          <div
              className={`form shadow ${this.state.isAdvancedSearch ? "": "hidden"}`}>
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
                  onChange={months => this.months = months}/>
            </div>
            <div className="form-col">
              <SearchBarTitle>Type</SearchBarTitle>
              <Options options="Article Bulb"
                       icons="description lightbulb_outline"
                       onChange={types => this.types = types}/>
            </div>
            <div className="form-col">
              <SearchBarTitle>Attachments</SearchBarTitle>
              <Options options="photos musics movies links others"
                       icons="photo_library library_music movie link more_horiz"
                       onChange={data => this.attachments=data}/>
            </div>
          </div>
        </div>
    );
  }
}
