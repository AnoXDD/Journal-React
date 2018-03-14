/**
 * Created by Anoxic on 6/6/2017.
 *
 * Just a progress bar
 */

import React, {Component} from "react";


export default class ProgressBar extends Component {

  render() {
    return (
        <div className={`progress-bar ${this.props.className || ""}`}>
            <span className="progress"
                  style={{left: `${(this.props.progress||0)*100}%`,
                   transition: this.props.progress === 0 ? "none" : undefined}}></span>
        </div>
    );
  }
}

