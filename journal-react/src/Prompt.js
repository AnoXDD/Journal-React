/**
 * Created by Anoxic on 050317.
 * A prompt that (not visually) block other components
 */

import React, {Component} from "react";
import Button from "./Button";

export default class Prompt extends Component {

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }

  handleKeyDown(e) {
    if (e.key === "Escape" &&
        (!this.props.className || this.props.className.indexOf("hidden") === -1)) {
      if (this.props.onClose) {
        this.props.onClose(e);
      } else if (this.props.onCancel) {
        this.props.onCancel(e);
      }
    }
  }

  render() {
    if (this.props.children) {
      // Has customized window
      return (
          <div className={`Prompt ${this.props.className || ""}`}>
            <span className="block"
                  onClick={this.props.onClose}/>
            {this.props.children}
          </div>
      );
    } else {
      // This is a message box
      return (
          <div
              className={`Prompt dim-bg flex-center ${this.props.className || ""}`}>
            <span className="block"
                  onClick={this.props.onClose}/>
            <div className="prompt-box shadow">
              <div className="dialog">
                <div className="title">{this.props.title}</div>
                <div className="message">{this.props.message}</div>
                <div className="btns">
                  <Button
                      className={`${this.props.cancel ? "" : "hidden"}`}
                      onClick={this.props.onCancel}
                      text={this.props.cancel || "cancel"}>cancel</Button>
                  <Button
                      className={`no ${this.props.no ? "" : "hidden"}`}
                      onClick={this.props.onNo}
                      text={this.props.no || "no"}>block</Button>
                  <Button
                      className={`yes ${this.props.yes ? "" : "hidden"}`}
                      onClick={this.props.onYes}
                      text={this.props.yes || "yes"}>done</Button>
                </div>
              </div>
            </div>
          </div>
      );
    }
  }
}