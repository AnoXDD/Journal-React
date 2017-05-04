/**
 * Created by Anoxic on 042017.
 * A calendar class to show the heatmap
 */

import React, {Component} from "react";
import NoScrollArea from "./NoScrollArea";
import R from "./R";

const monthBlocks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
const yearBlocks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export default class Calendar extends Component {

  MONTH_DAY = [31, 28 + ((this.props.year % 4) || ((this.props.year % 100 === 0) && (this.props.year % 400)) ? 0 : 1), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  now = new Date().getTime();

  constructor(props) {
    super(props);

    // Set the state of squares
    if (this.props.debug) {
      this.state = {
        squares  : [[2, 2, 1, null, 2, 2, 3, null, null, null, null, 2, 3, 2, 4, null, 1, null, 1, null, null, null, 1, null, null, null, 2, 1, null, 1], [3, null, 1, 3, 4, 1, null, 2, null, 2, 2, 1, null, 1, 2, 1, 2, 3, 1, null, null, 1, 1, null, 4, 2, 1], [null, null, 1, 4, 1, 3, 1, null, null, 3, 1, 4, 1, 2, null, null, 3, 3, 1, 3, 5, null, 1, 3, 2, 1, 2, 2, 1, 1, 5], [1, 1, 1, 2, 1, 1, 4, 5, 1, 1, null, null, 2, 3, 1, 3, 4, 5, 4, 2, 1, 5, 6, 4, 5, 5, 7, 6, 6, 6], [8, 5, 3, 3, 1, 4, 8, 3, 9, 1, 1, 2, 1, 5, 3, 1, null, 1, 4, 3, 4, 2, 2, null, 1, 3, null, 1, 1, 2], [2, 1, 1, 1, 1, 1, null, null, 1, 2, null, 5, 1, null, 1, 1, 3, 2, 2, null, 1, null, 1, 3, null, 1, 3, 2, 1, 2], [6, 1, 1, null, null, 1, 1, 2, null, null, 1, 1, 1, 1, null, null, null, null, 1, 1, 2, null, 1, 2, 1, 6, 1, 2, 1, 3], [null, 3, 1, 1, 1, null, null, null, 1, 2, 2, 1, null, null, null, null, 1, null, 1, 2, null, null, null, null, 1, 1, null, null, 1], [1, 3, 3, 1, 1, 1, 1, 2, 2, 2, 1, 2, null, 1, 2, 2, 2, null, 2, null, 2, 5, 4, 2, null, null, null, 1, 2], [2, 1, null, null, null, 1, 1, 1, 1, null, null, null, 2, 2, null, null, null, 2, 2, 3, 1, 1, null, null, null, 2, 2, 1, null, null, 1], [null, null, null, 1, null, 1, null, null, null, null, 1, null, null, null, null, null, null, 1, null, null, null, null, null, null, 1], [null, null, null, null, null, null, null, 1, 1, null, null, null, null, null, 1, null, null, null, null, null, null, 1, 1, null, null, null, null, null, null, 1]],
        triangles: [[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1], [null, 1, null, null, 1], [null, null, null, 1, null, 1, null, null, null, null, null, null, 1, null, null, null, null, null, null, null, null, null, null, 1, null, null, 1, null, 1, null, 1], [null, null, null, null, 1, null, null, null, null, null, null, null, null, null, null, null, 1, 1], [null, null, null, null, null, 1, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1, null, null, null, null, null, null, null, null, 1], [null, 1, null, null, 1, null, null, null, null, null, null, null, null, null, 1, null, 1, null, null, null, null, 1, null, 1, null, 1, null, null, 1], [null, null, null, 1, null, 1, null, null, null, null, null, null, null, 1, null, null, null, null, null, null, null, 1, 1, null, 1, null, null, 1, null, 1], [null, null, null, null, null, null, 1, 1, 1], [1, 1, null, 1], [1, null, null, null, null, null, 1, null, null, null, null, null, null, null, null, null, null, 1, null, 1, null, null, 1, null, 1], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1], [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 1, null, null, 1]],
      };
    }

    // this.updateStats = this.updateStats.bind(this);
    //
    this.state = this.updateStats(this.props);
  }

  shouldComponentUpdate(nextProps) {
    return !nextProps.hidden || !this.props.hidden;
  }

  componentWillUpdate(nextProps, nextState) {
    this.MONTH_DAY[1] = 28 + ((this.props.year % 4) || ((this.props.year % 100 === 0) && (this.props.year % 400)) ? 0 : 1);

    let updatedState = this.updateStats(nextProps);
    nextState.squares = updatedState.squares;
    nextState.triangles = updatedState.triangles;
  }

  updateStats(props) {
    let squares = [[], [], [], [], [], [], [], [], [], [], [], []],
        triangles = [[], [], [], [], [], [], [], [], [], [], [], []],
        nextState = {};

    for (let d of props.data) {
      let time = new Date(d.time.created),
          month = time.getMonth(),
          day = time.getDate() - 1;

      if (d.type === R.TYPE_BULB) {
        squares[month][day] = (squares[month][day] + 1) || 1;
      } else {
        triangles[month][day] = 1;
      }
    }

    nextState.squares = squares;
    nextState.triangles = triangles;

    return nextState;
  };

  generateFirstPadding() {
    let day = new Date(this.props.year || new Date().getFullYear(), 0).getDay();
    return (
        <span className={`first-padding-${day}`}></span>
    );
  }

  generateLastPadding() {
    return (
        <span className="last-padding"></span>
    )
  }

  handleClick(month, day) {
    let times = Object.keys(this.props.contentStyle),
        i = times.findIndex(t => {
          let date = new Date(parseInt(t, 10));
          return date.getMonth() === month && date.getDate() === day;
        });

    if (i !== -1) {
      this.props.onBlockClick(this.props.contentStyle[times[i]]);
    }
  }

  render() {
    this.now = new Date().getTime();

    // Calculate max-height
    let maxHeight = (new Date(this.props.year || new Date().getFullYear(), 0).getDay() === 6 && this.MONTH_DAY[1] === 29) ? 1150 : 1130;

    return (
        <div
            className={`Calendar ${this.props.className || ""} ${this.props.hidden ? "hidden" : ""}`}
            style={{maxHeight: `${maxHeight}px`}}>
          <NoScrollArea padding="10px" backgroundColor="#212121">
            <div className="calendar-table">
              <span className="month-list"></span>
              <div className="day-blocks">
                {this.generateFirstPadding()}
                {yearBlocks.map((month, im) =>
                    monthBlocks.map((day, id) => {
                          if (new Date(this.props.year, im, id + 2) > this.now || id >= this.MONTH_DAY[im]) {
                            return "";
                          }
                          return (
                              <div key={`calendar-${month}-${day}`}
                                   className={`day-block accent-${Math.min(9, this.state.squares[im][id] || 0)}${id === 0 ? ` month-first month-${im} ` : " "}${this.state.triangles[im][id] ? "triangle " : " "}${id >= this.MONTH_DAY[im] - 7 ? " last-seven" : " "}${id === this.MONTH_DAY[im] - 1 ? " last-one": " "}`}
                              >
                                <div className="day-block-wrapper"
                                     onClick={() => this.handleClick(month, day)}
                                >
                                  <div className="text flex-center">
                                    <span>{day}</span>
                                  </div>
                                </div>
                              </div>
                          );
                        }
                    )
                )}
                {this.generateLastPadding()}
              </div>
            </div>
          </NoScrollArea>
        </div>
    );
  }
}