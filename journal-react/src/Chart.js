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
import R from "./R";

export default class Chart extends Component {

  data = [];
  dataMonth = {};
  dataReverse = [];

  constructor(props) {
    super(props);
    this.state = {
      keywords: ["的", "在", "s", "a", "2", "32", "321", "33333", "dfsa"],
    }

    this.version = props.version;

    this.handleStateChange(this.state.keywords);
    this.handleStateChange = this.handleStateChange.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    this.handleStateChange(nextState.keywords,
        nextProps.version !== this.version ? nextProps.data : undefined);
    this.version = nextProps.version;
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
        if (this.state.keywords.indexOf(keyword) !== -1 || hasNewData) {
          if ((data.title && data.title.indexOf(keyword) !== -1) ||
              data.body.indexOf(keyword) !== -1) {
            // This keyword is found
            ++this.dataMonth[keyword][month];
            ++this.data[index][keyword];
          }
        }
      }
    }
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
              {this.state.keywords.map(keyword =>
                  <Line key={keyword} dataKey={keyword} dot={false}/>)
              }
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
                    this.state.keywords.map(keyword => {
                      return (
                          <tr className="row-data" key={keyword}>
                            <td className="cell-keyword">{keyword}</td>
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