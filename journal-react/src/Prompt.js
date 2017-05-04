/**
 * Created by Anoxic on 050317.
 * A prompt that (not visually) block other components
 */

import React, {Component} from "react";

export default class Prompt extends Component {

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }

  handleKeyDown(e) {
    if (e.key === "Escape") {
      this.props.onClose(e);
    }
  }

  render() {
    return (
        <div className={`Prompt ${this.props.className || ""}`}>
          <span className="block"
                onClick={this.props.onClose}/>
          {this.props.children}
        </div>
    )
  }
}