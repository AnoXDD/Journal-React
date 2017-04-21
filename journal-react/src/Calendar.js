/**
 * Created by Anoxic on 042017.
 */

import React, {Component} from "react";

import "./Calendar.css";

const monthBlocks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
const yearBlocks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export default class Calendar extends Component {

  MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  MONTH_DAY = [31, 28 + ((this.props.year % 4) || ((this.props.year % 100 === 0) && (this.props.year % 400)) ? 0 : 1), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  state = {
    heatmap: [[], [], [], [], [], [], [], [], [], [], [], []]
  };

  constructor(props) {
    super(props);

    // Set the state of heatmap
  }


  render() {
    return (
        <div className="Calendar">
          <div className="calendar-table">
            <span className="month-list"></span>
            <div className="day-blocks">
              {yearBlocks.map((month, im) =>
                  monthBlocks.map((day, id) => {
                        if (id >= this.MONTH_DAY[im]) {
                          return "";
                        }

                        return (
                            <div key={`calendar-${month}-${day}`}
                                 className={`day-block accent-${Math.min(9, this.state.heatmap[im][id] || 0)}${id === 0 ? ` month-first month-${im} ` : " "}${id >= this.MONTH_DAY[im] - 7 ? " last-seven" : " "}${id === this.MONTH_DAY[im] - 1 ? " last-one": " "}`}
                                 onMouseOver={()=>{var {heatmap}=this.state;heatmap[im][id]=heatmap[im][id]||0;++heatmap[im][id];this.setState({heatmap:heatmap});}}>
                              <div className="day-block-wrapper">
                                <div className="text">
                                </div>
                              </div>
                            </div>
                        );
                      }
                  )
              )}
            </div>
          </div>
        </div>
    );
  }
}