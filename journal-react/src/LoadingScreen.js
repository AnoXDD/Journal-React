/**
 * Created by Anoxic on 6/4/2017.
 * A loading screen with progress bar and title
 */

import React, {Component} from "react";

import Button from "./Button";

export default class LoadingScreen extends Component {

  componentShouldUpdate(nextProps) {
    return nextProps.title !== "" || this.props.title !== "";
  }

  render() {
    if (this.props.title === "") {
      return null;
    }

    return (
        <div className="loading-screen flex-center">
          <Button loading={true}>clear</Button>
          <div className="title">{this.props.title}</div>
          <div className="progress-bar">
            <span className="progress"
                  style={{left: `${(this.props.progress||0)*100}%`,
                   transition: this.props.progress === 0 ? "none" : undefined}}></span>
          </div>
        </div>
    );
  }
}
