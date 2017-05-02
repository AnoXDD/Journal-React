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

  constructor(props) {
    super(props);

    let {icons, options} = this.props;
    this.options = options.split(" ");
    this.icons = icons ? icons.split(" ") : [];

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(option) {
    let index = this.props.value.indexOf(option);
    if (index === -1) {
      // Does not exist
      this.props.onChange([...this.props.value, option]);
    } else {
      let newValue = this.props.value;
      newValue.splice(index, 1);
      this.props.onChange(newValue);
    }

  }

  render() {
    return (
        <div className={`Options ${this.icons.length ? "" : "text"}`}>
          { this.options.map((option, index) =>
              <a
                  key={`option-${option}`}
                  className={`option ${this.props.value.indexOf(option) !== -1 ? "selected" : ""}`}
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

  ATTACHMENTS = `${R.PROP_PHOTO} ${R.PROP_MUSIC} ${R.PROP_MOVIE} ${R.PROP_LINK} ${R.PROP_OTHER}`;

  state = {
    value      : '',
    tags       : [],
    keywords   : [],
    months     : [],
    types      : [],
    attachments: [],
    inputValue : "",

    isAdvancedSearch   : false,
    advancedSearchValue: "",
  };

  constructor(props) {
    super(props);

    this.toggleIsAdvancedSearch = this.toggleIsAdvancedSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.isAdvancedSearch) {
      // Calculate the new input value
      nextState.advancedSearchValue = `${nextState.keywords.join(" ")}${nextState.tags.length ? (" #" + nextState.tags.join(
          " #")) : ""}${nextState.months.length ? ` @[${nextState.months.join(
          ",")}]` : ""}${nextState.types.length ? ` isType:[${nextState.types.join(
          ",")}]` : ""}${nextState.attachments.length ? ` hasAttachments:[${nextState.attachments.join(
          ",")}]` : ""}`;
    }
  }

  toggleIsAdvancedSearch() {
    this.setState({
      isAdvancedSearch: !this.state.isAdvancedSearch,
    });
  }

  clearSearch() {
    this.setState({
      value      : "",
      tags       : [],
      keywords   : [],
      months     : [],
      types      : [],
      attachments: [],
    });

    this.handleSubmit();
  }

  handleInputChange(e) {
    if (!this.state.isAdvancedSearch) {
      this.setState({inputValue: e.target.value});
    }
  }

  handleSubmit() {
    if (this.state.isAdvancedSearch) {
      for (let d of this.state.types) {
        if (d === "Article") {
          var hasArticle = true;
        }
        if (d === "Bulb") {
          var hasBulb = true;
        }
      }

      let months = [];
      for (let month of this.state.months) {
        let index = R.month.indexOf(month);

        if (index !== -1) {
          months.push(index);
        }
      }

      this.props.onChange({
        hasArticle : !!hasArticle,
        hasBulb    : !!hasBulb,
        attachments: this.state.attachments,
        months     : months,
        keywords   : this.state.keywords,
        tags       : this.state.tags,
        simple     : false,
      });
    } else {
      let value = this.state.inputValue.trim();

      this.props.onChange({
        keywords: value.length ? value.split(" ") : [],
        simple  : true,
      });
    }
  }

  render() {
    return (
        <div className="SearchBar">
          <div className="flex-center search-bar-wrapper">
            <input
                type="text"
                className="keyword normal underlined"
                value={this.state.isAdvancedSearch ? this.state.advancedSearchValue : this.state.inputValue}
                onChange={this.handleInputChange}
                disabled={this.state.isAdvancedSearch}
            />
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
                  value={this.state.months}
                  onChange={months => this.setState({months: months})}/>
            </div>
            <div className="form-col">
              <SearchBarTitle>Type</SearchBarTitle>
              <Options options="Article Bulb"
                       icons="description lightbulb_outline"
                       value={this.state.types}
                       onChange={types => this.setState({types: types})}/>
            </div>
            <div className="form-col">
              <SearchBarTitle>Attachments</SearchBarTitle>
              <Options options={this.ATTACHMENTS}
                       icons="photo_library library_music movie link more_horiz"
                       value={this.state.attachments}
                       onChange={data => this.setState({attachments: data})}/>
            </div>
          </div>
        </div>
    );
  }
}
