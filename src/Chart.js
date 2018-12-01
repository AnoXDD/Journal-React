// @flow strict-local

/**
 * Created by Anoxic on 050617.
 *
 * This is a chart to represent the stats
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import NoScrollArea from "./lib/NoScrollArea";
import Button from "./lib/Button";
import Toggle from "./lib/Toggle";
import R from "./R";

import * as React from "react";


const KEYWORD_DELIMITOR = ",";

type NewKeywordProps = {|
  +onClick: (value: string) => void,
|};

type NewKeywordState = {|
  value: string,
|};

class NewKeyword extends React.Component<NewKeywordProps, NewKeywordState> {

  state: NewKeywordState = {
    value: "",
  };

  handleKeyDown = (e: SyntheticKeyboardEvent<>): void => {
    if (e.key === "Enter") {
      this.handleClick();
    }
  };

  handleClick = (): void => {
    this.props.onClick(this.state.value);
    this.setState({
      value: "",
    });
  };

  render(): React.Node {
    return (
      <tr className="row-data">
        <td className="cell-keyword">
          <div
            className="cell-keyword-wrapper flex-center">
            <Button className="dark narrow"
                    tooltip={`Add keyword, use comma(${KEYWORD_DELIMITOR}) to separate synonyms`}
                    onClick={() => this.props.onClick(this.state.value)}
            >add</Button>
            <input className="dark normal underlined"
                   value={this.state.value}
                   onChange={e => this.setState({value: e.target.value})}
                   onKeyDown={this.handleKeyDown}
            />
          </div>
        </td>
      </tr>
    );
  }
}

type ChartProps = {|
  +data: Data,
  +hidden: boolean,
  +version: number,
|};

type ChartState = {|
  // Keywords that are deselected in the chart so not showing in the chart
  hiddenKeywords: Array<string>,
  isGroupedByMonth: boolean,
  keywords: Array<string>,
|};

export default class Chart extends React.Component<ChartProps, ChartState> {

  data = [];
  dataMonthChart = [];
  dataMonthTable = {};

  processedKeyWords = [];

  version = 0;

  /**
   * Records the original keyword on focus
   * @type {string}
   */
  lastKeywordInput = "";

  constructor(props: ChartProps) {
    super(props);
    this.state = {
      keywords        : [],
      hiddenKeywords  : [],
      isGroupedByMonth: false,
    };

    for (let month of R.MONTH) {
      this.dataMonthChart.push({time: month});
    }

    this.handleStateChange(this.state.keywords);
  }

  shouldComponentUpdate(nextProps: ChartProps): boolean {
    return !nextProps.hidden || nextProps.version !== this.version;
  }

  componentWillUpdate(nextProps: ChartProps, nextState: ChartState) {
    if (nextProps.version !== this.version) {
      // A new data, clean up everything

      this.data = [];
      this.dataMonthChart = R.MONTH.map(month => ({time: month}));
      this.dataMonthTable = {};
      this.processedKeyWords = [];

      this.version = nextProps.version;
    }

    // Only update when the user is not typing a new keyword
    this.handleStateChange(nextState.keywords, nextProps.data);
  }

  getHashedColor(word: string): string {
    let hash = 0, i, chr;
    if (word.length === 0) {
      return '#fff';
    }
    for (i = 0; i < word.length; i++) {
      chr = word.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return `#${(1 / hash).toString(16).substr(-6)}`;
  }

  handleKeywordBlur = (e: SyntheticInputEvent<>, index: number): void => {
    const {value} = e.target;
    if (value !== this.lastKeywordInput) {
      if (this.state.keywords.indexOf(value) !== -1) {
        // Duplicates are not allowed
        e.target.value = this.lastKeywordInput;
      } else {
        let keywords = [...this.state.keywords];
        keywords[index] = value;

        this.setState({keywords: keywords});
      }
    }
  };

  handleKeywordRemove = (index: number): void => {
    let keyword = this.state.keywords[index],
      hiddenKeywordIndex = this.state.hiddenKeywords.indexOf(keyword),
      keywords = [...this.state.keywords];
    keywords.splice(index, 1);

    if (hiddenKeywordIndex === -1) {
      this.setState({keywords: keywords});
    } else {
      let {hiddenKeywords} = this.state;
      hiddenKeywords.splice(hiddenKeywordIndex, 1);

      this.setState({
        keywords      : keywords,
        hiddenKeywords: hiddenKeywords
      });
    }
  };

  handleKeywordToggleVisibility(index: number): void {
    let hiddenKeywords = [...this.state.hiddenKeywords],
      keyword = this.state.keywords[index],
      hiddenKeywordIndex = hiddenKeywords.indexOf(keyword);

    if (hiddenKeywordIndex === -1) {
      this.setState({hiddenKeywords: [...this.state.hiddenKeywords, keyword]});
    } else {
      hiddenKeywords.splice(hiddenKeywordIndex, 1);
      this.setState({hiddenKeywords: hiddenKeywords});
    }
  }

  handleKeywordAdd = (value: string): void => {
    if (value.length && this.state.keywords.indexOf(value) === -1) {
      this.setState({
        keywords: [...this.state.keywords, value],
      });
    }
  };

  handleStateChange = (keywords: Array<string>,
                       newData: Data = this.props.data): void => {
    let hasNewData = !!newData;
    let index = 0;

    for (let data of newData) {
      let date = new Date(data.time.created),
        month = date.getMonth(),
        day = date.getDate(),
        key = `${R.month[month]} ${day}`;

      if (!this.data[index]) {
        // Create a new entry
        this.data.push({time: key});
      } else if (this.data[index].time !== key) {
        if (!this.data[++index]) {
          // Create a new entry
          this.data.push({time: key});
        }
      }

      for (let keyword of keywords) {
        // Initialize the key in the data if necessary
        this.data[index][keyword] = this.data[index][keyword] || 0;
        this.dataMonthChart[month][keyword] = this.dataMonthChart[month][keyword] || 0;
        this.dataMonthTable[keyword] = this.dataMonthTable[keyword] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // Test if this key needs to be re-calculated
        if (this.processedKeyWords.indexOf(keyword) === -1 || hasNewData) {
          let keywordArray = keyword.split(KEYWORD_DELIMITOR);

          for (let k of keywordArray) {
            if ((data.title && data.title.indexOf(k) !== -1) ||
              R.highlightArrayToString(data.body).indexOf(k) !== -1) {
              // This keyword is found
              ++this.dataMonthTable[keyword][month];
              ++this.dataMonthChart[month][keyword];
              ++this.data[index][keyword];
              break;
            }
          }
        }
      }
    }

    this.processedKeyWords = [...keywords];
  };

  render(): React.Node {
    return (
      <div className="Chart">
        <header className="main-header flex-center">
          <Button className="dark align-right wider"
                  onClick={() => this.setState({isGroupedByMonth: !this.state.isGroupedByMonth})}
                  text={this.state.isGroupedByMonth ? "Group by day" : "Group by month"}>event</Button>
        </header>
        <div className="content">
          <div className="chart-wrapper">
            <ResponsiveContainer minWidth={800}
                                 height={window.innerHeight * .6 - 80}>
              <LineChart
                data={this.state.isGroupedByMonth ? [...this.dataMonthChart] : [...this.data].reverse()}>
                <XAxis dataKey="time"/>
                <YAxis/>
                <Tooltip/>
                <Legend />
                {this.state.keywords.map(keyword => {
                  if (this.state.hiddenKeywords.indexOf(keyword) === -1) {
                    return (
                      <Line key={keyword}
                            stroke={this.getHashedColor(keyword)}
                            dataKey={keyword} dot={false}/>
                    );
                  }
                  return null;
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="table-wrapper">
            <div
              className={`table-header-out ${this.state.keywords.length ? "" : "hidden"}`}>
              <table className="table-header">
                <thead>
                <tr className="row-header">
                  <td className="cell-blank"></td>
                  {R.month.map(month =>
                    <td key={month} className="cell-data">{month}</td>
                  )}
                </tr>
                </thead>
              </table>
            </div>
            <NoScrollArea padding="10px">
              <div className="table-data-out">
                <table className="table-data">
                  <tbody>
                  {
                    this.state.keywords.map((keyword, index) => {
                      return (
                        <tr className="row-data" key={keyword}>
                          <td className="cell-keyword">
                            <div
                              className="cell-keyword-wrapper flex-center">
                              <Toggle className="dark narrow"
                                      tooltip="Toggle visibility in the chart"
                                      onClick={() => this.handleKeywordToggleVisibility(
                                        index)}
                                      isChanging={this.state.hiddenKeywords.indexOf(
                                        keyword) !== -1}
                                      firstIcon="check_box"
                                      secondIcon="check_box_outline_blank"/>
                              <Button className="dark narrow"
                                      tooltip="Remove keyword"
                                      onClick={() => this.handleKeywordRemove(
                                        index)}
                              >clear</Button>
                              <input className="dark normal underlined"
                                     defaultValue={keyword}
                                     onFocus={
                                       e => this.lastKeywordInput = e.target.value}
                                     onBlur={e => this.handleKeywordBlur(e,
                                       index)}
                              />
                            </div>
                          </td>
                          {this.dataMonthTable[keyword].map((data, index) =>
                            <td key={`${keyword}-${index}`}
                                className="cell-data">{data || 0}</td>
                          )}
                        </tr>
                      );
                    })
                  }
                  <NewKeyword onClick={this.handleKeywordAdd}/>
                  </tbody>
                </table>
              </div>
            </NoScrollArea>
          </div>
        </div>
      </div>
    );
  }
}