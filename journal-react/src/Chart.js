/**
 * Created by Anoxic on 050617.
 *
 * This is a chart to represent the stats
 */

import React, {Component} from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

import NoScrollArea from "./NoScrollArea";
import Button from "./Button";
import Toggle from "./Toggle";
import R from "./R";


export default class Chart extends Component {

  processedKeyWords = [];

  data = [];
  dataMonth = {};
  dataReverse = [];

  /**
   * Records the original keyword on focus
   * @type {string}
   */
  lastKeywordInput = "";

  constructor(props) {
    super(props);
    this.state = {
      keywords      : ["的", "在", "s", "a", "2", "32", "321", "33333", "dfsa"],
      hiddenKeywords: [],
    }

    this.version = props.version;

    this.handleStateChange(this.state.keywords);
    this.handleKeywordBlur = this.handleKeywordBlur.bind(this);
    this.handleKeywordRemove = this.handleKeywordRemove.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    this.handleStateChange(nextState.keywords,
        nextProps.version !== this.version ? nextProps.data : undefined);
    this.version = nextProps.version;
  }

  getHashedColor(word) {
    var hash = 0, i, chr;
    if (word.length === 0) {
      return hash;
    }
    for (i = 0; i < word.length; i++) {
      chr = word.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return `#${(1 / hash).toString(16).substr(-6)}`;
  }

  handleKeywordBlur(e, index) {
    let {value} = e.target;
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
  }

  handleKeywordRemove(index) {
    let keywords = [...this.state.keywords];
    keywords.splice(index, 1);

    this.setState({keywords: keywords});
  }

  handleKeywordToggleVisibility(index) {
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

  handleStateChange(keywords, newData) {
    let hasNewData = !!newData;

    newData = newData || this.props.data;

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
        this.dataMonth[keyword] = this.dataMonth[keyword] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        // Test if this key needs to be re-calculated
        if (this.processedKeyWords.indexOf(keyword) === -1 || hasNewData) {
          if ((data.title && data.title.indexOf(keyword) !== -1) ||
              data.body.indexOf(keyword) !== -1) {
            // This keyword is found
            ++this.dataMonth[keyword][month];
            ++this.data[index][keyword];
          }
        }
      }
    }

    this.processedKeyWords = [...keywords];
  }

  render() {
    return (
        <div className="Chart">
          <ResponsiveContainer width='100%' height={window.innerHeight * .6}>
            <LineChart data={[...this.data].reverse()}>
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
          <div className="table-wrapper">
            <div className="table-header-out">
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
                              <div className="cell-keyword-wrapper flex-center">
                                <Toggle className="dark"
                                        onClick={() => this.handleKeywordToggleVisibility(index)}
                                        isChanging={this.state.hiddenKeywords.indexOf(keyword) !== -1}
                                        firstIcon="check_box"
                                        secondIcon="check_box_outline_blank"/>
                                <Button className="dark"
                                        onClick={() => this.handleKeywordRemove(index)}
                                >clear</Button>
                                <input className="dark normal underlined"
                                       defaultValue={keyword}
                                       onFocus={e => this.lastKeywordInput = e.target.value}
                                       onBlur={e => this.handleKeywordBlur(e, index)}
                                />
                              </div>
                            </td>
                            {this.dataMonth[keyword].map((data, index) =>
                                <td key={`${keyword}-${index}`}
                                    className="cell-data">{data || 0}</td>
                            )}
                          </tr>
                      );
                    })
                  }
                  </tbody>
                </table>
              </div>
            </NoScrollArea>
          </div>
        </div>
    );
  }
}