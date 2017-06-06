/**
 * Created by Anoxic on 6/4/2017.
 * A loading screen with progress bar and title
 */

import React, {Component} from "react";

import Button from "./Button";
import ProgressBar from "./ProgressBar";

export default class LoadingScreen extends Component {

  shouldComponenUpdate(nextProps) {
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
          <ProgressBar progress={this.props.progress}/>
        </div>
    );
  }
}
