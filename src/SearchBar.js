// @flow strict-local

/**
 * Created by Anoxic on 042917.
 * A search bar to be used on the top
 */

import Button from "./lib/Button";
import Toggle from "./lib/Toggle";
import PredictionInputs from "./PredictionInputs";
import Prompt from "./lib/Prompt";
import R from "./R";

import * as React from "react";

import Ink from "react-ink";

type OptionsProps = {|
  +icons?: Array<string>, // space separated
  +options: Array<string>, // space separated
  +value: Array<string>,
  +onChange: (value: Array<string>) => void,
|};

class Options extends React.PureComponent<OptionsProps> {

  handleClick(option: string): void {
    let index = this.props.value.indexOf(option);
    if (index === -1) {
      // Does not exist
      this.props.onChange([...this.props.value, option]);
    } else {
      let newValue = [...this.props.value];
      newValue.splice(index, 1);
      this.props.onChange(newValue);
    }
  }

  render(): React.Node {
    const {icons = []} = this.props;

    return (
      <div className={`Options ${icons.length ? "" : "text"}`}>
        {this.props.options.map((option, index) =>
          <a
            key={`option-${option}`}
            className={`option ${this.props.value.indexOf(option) !==
            -1 ? "selected" : ""}`}
            onClick={() => this.handleClick(option)}>
            <Ink/>
            <div className="vertical-align icon-wrapper">
              <i className="material-icons vertical-align-wrapper">
                {icons[index] || ""}
              </i>
            </div>
            <div className="vertical-align text-wrapper">
                  <span className="vertical-align-wrapper btn-text">
                            {option}
                  </span>
            </div>
          </a>,
        )}
      </div>
    );
  }
}

type SearchBarTitleProps = {|
  +children: React.Node
|};

class SearchBarTitle extends React.PureComponent<SearchBarTitleProps> {
  render(): React.Node {
    return (
      <div className="vertical-align title-dark">
        <div className="vertical-align-wrapper">{this.props.children}</div>
      </div>
    );
  }
}

const DEFAULT_MONTH = R.month;
const DEFAULT_TYPES = [R.TYPE_ARTICLE, R.TYPE_BULB];
const DEFAULT_ATTACHMENTS = [];

type Props = {|
  +isBoundSearch: boolean,
  +mapBound: MapBound,
  +onChange: (c: SearchCriteria) => void;
  +tagPrediction: string,
|}

type State = {|
  advancedSearchValue: string,
  attachments: Array<string>,
  inputValue: string,
  isAdvancedSearch: boolean,
  keywords: Array<string>,
  months: Array<string>,
  tags: Array<string>,
  types: Array<string>,
|};

export default class SearchBar extends React.Component<Props, State> {

  ATTACHMENTS: Array<string> = [
    R.PROP_PHOTO,
    R.PROP_MUSIC,
    R.PROP_MOVIE,
    R.PROP_LINK,
    R.PROP_OTHER,
  ];

  state: State = {
    tags: [],
    keywords: [],
    months: DEFAULT_MONTH,
    types: DEFAULT_TYPES,
    attachments: DEFAULT_ATTACHMENTS,
    inputValue: "",

    isAdvancedSearch: false,
    advancedSearchValue: "",
  };

  componentWillUpdate(nextProps: Props, nextState: State): void {
    if (this.state.isAdvancedSearch) {
      // Calculate the new input value
      nextState.advancedSearchValue = `${nextState.keywords.join(" ")}${nextState.tags.length ? (
        " #" + nextState.tags.join(
          " #")
      ) : ""}${nextState.months.length ? ` @[${nextState.months.join(
        ",")}]` : ""}${nextState.types.length ? ` isType:[${nextState.types.join(
        ",")}]` : ""}${nextState.attachments.length ? ` hasAttachments:[${nextState.attachments.join(
        ",")}]` : ""}`;

      // `keyword` dominates
      let keywords = [...nextState.keywords];
      keywords.forEach((keyword, i, keywords) => {
        // Escape it
        const processedKeyword = keyword.replace(/"/g, '\\"');
        if (processedKeyword.indexOf(" ") !== -1) {
          // It has space
          keywords[i] = `"${processedKeyword}"`;
        }
      });

      nextState.inputValue = keywords.join(" ");
    } else {
      // `inputValue` dominates

      nextState.keywords = this.convertInputValueToKeyWords(nextState.inputValue.trim());
    }
  }

  convertInputValueToKeyWords(inputValue: string): Array<string> {
    let keywords = [],
      word = "",
      skipQuote = false,
      skipSpace = false;

    for (let i = 0, len = inputValue.length; i < len; ++i) {
      let c = inputValue[i];

      if (c === " ") {
        if (skipSpace) {
          word = word.concat(c);
        } else {
          if (keywords.indexOf(word) === -1) {
            keywords.push(word);
          }

          word = "";
        }
      } else if (c === '\\') {
        skipQuote = true;
      } else if (c === '"') {
        if (skipQuote) {
          word = word.concat(c);
          skipQuote = false;
        } else {
          skipSpace = !skipSpace;
        }
      } else {
        word = word.concat(c);
      }
    }

    if (word.length && keywords.indexOf(word) === -1) {
      keywords.push(word);
    }

    return keywords;
  };

  toggleIsAdvancedSearch = (): void => {
    this.setState({
      isAdvancedSearch: !this.state.isAdvancedSearch,
    });
  };

  clearSearch = (): void => {
    this.setState({
      inputValue: "",
      tags: [],
      keywords: [],
      months: DEFAULT_MONTH,
      types: DEFAULT_TYPES,
      attachments: DEFAULT_ATTACHMENTS,
    }, () => this.handleSubmit(true));
  };

  handleInputChange = (e: SyntheticInputEvent<>): void => {
    const {target} = e;
    if (!(
      target instanceof HTMLInputElement
    )) {
      return;
    }

    if (!this.state.isAdvancedSearch) {
      this.setState({inputValue: target.value});
    }
  };

  handleInputKeyDown = (e: SyntheticKeyboardEvent<>): void => {
    if (e.key === "Enter") {
      this.handleSubmit();
    }
  };

  handleSubmit = (isClear?: boolean = true): void => {
    if (this.state.isAdvancedSearch) {
      for (let d of this.state.types) {
        if (d === R.TYPE_ARTICLE) {
          var hasArticle = true;
        }
        if (d === R.TYPE_BULB) {
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
        hasArticle: !!hasArticle,
        hasBulb: !!hasBulb,
        attachments: this.state.attachments,
        months: months,
        keywords: this.state.keywords,
        tags: this.state.tags,
        simple: false,
        clear: isClear,
      });
    } else {
      let value = this.state.inputValue.trim();

      this.props.onChange({
        keywords: value.length ? value.split(" ") : [],
        simple: true,
        clear: isClear,
      });
    }
  };

  handlePromptClose = (): void => {
    this.handleSubmit();
    this.setState({isAdvancedSearch: false});
  };

  render(): React.Node {
    return (
      <div className="SearchBar">
        <Prompt
          className={`advanced-search ${this.state.isAdvancedSearch ? "" : "hidden"}`}
          onClose={this.handlePromptClose}
        >
          <div
            className={`form prompt-child shadow`}>
            <div className="form-row">
              <SearchBarTitle>Keyword</SearchBarTitle>
              <PredictionInputs
                className={`tag white-background new-tag-wrapper`}
                tagPrediction={[]}
                tags={this.state.keywords}
                onChange={keywords => this.setState({keywords: keywords})}
              />
            </div>
            <div className="form-row">
              <SearchBarTitle>Tags</SearchBarTitle>
              <PredictionInputs
                className={`tag white-background new-tag-wrapper`}
                tagPrediction={this.props.tagPrediction.split(" ")}
                tags={this.state.tags}
                onChange={tags => this.setState({tags: tags})}
              />
            </div>
            <div className="form-row">
              <SearchBarTitle>Time</SearchBarTitle>
              <Options
                options={[
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ]}
                value={this.state.months}
                onChange={months => this.setState({months: months})}/>
            </div>
            <div className="form-row">
              <SearchBarTitle>Type</SearchBarTitle>
              <Options options={[R.TYPE_ARTICLE, R.TYPE_BULB]}
                       icons={["description", "lightbulb_outline"]}
                       value={this.state.types}
                       onChange={types => this.setState({types: types})}/>
            </div>
            <div className="form-row">
              <SearchBarTitle>Attachments</SearchBarTitle>
              <Options options={this.ATTACHMENTS}
                       icons={[
                         "photo_library",
                         "library_music",
                         "movie",
                         "link",
                         "more_horiz",
                       ]}
                       value={this.state.attachments}
                       onChange={data => this.setState({attachments: data})}/>
            </div>
          </div>
        </Prompt>
        <div
          className={`flex-center search-bar-wrapper ${this.state.isAdvancedSearch ? "max-z-index" : ""}`}>
          <input
            type="text"
            className={`keyword normal underlined ${this.state.isAdvancedSearch ? "max-z-index" : ""}`}
            value={this.state.inputValue}
            onChange={this.handleInputChange}
            onKeyDown={this.handleInputKeyDown}
            disabled={this.state.isAdvancedSearch}
          />
          <div className="btns">
            <Button className="dark z-index-inherit"
                    tooltip="Clear keyword"
                    onClick={this.clearSearch}
            >clear</Button>
            <Toggle firstIcon="expand_more" secondIcon="expand_less"
                    className="dark z-index-inherit"
                    tooltip="More options"
                    onClick={this.toggleIsAdvancedSearch}
                    isChanging={this.state.isAdvancedSearch}
            />
            <Button className="dark z-index-inherit"
                    text={`search${this.props.isBoundSearch ? " in this area" : ""}`}
                    onClick={this.handleSubmit}
                    tooltip="Toggle map view to limit search in an area"
            >search</Button>
          </div>
        </div>
      </div>
    );
  }
}
