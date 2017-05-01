/**
 * Created by Anoxic on 042317.
 * A simple class for a button
 */

import React, {Component} from "react";
import Ink from "react-ink";

export default class Button extends Component {

  render() {
    let disabled = {};
    if (this.props.disabled) {
      disabled.disabled = "disabled";
    }

    return (
        <a className={`btn ${this.props.text ? "text": ""} ${this.props.className || ""}`}
           onClick={this.props.onClick || void(0)} {...disabled}>
          <Ink/>
          <div className="vertical-align icon-wrapper">
            <i className="material-icons vertical-align-wrapper">
              {this.props.children}
            </i>
          </div>
          <div className="vertical-align text-wrapper">
            <span className="vertical-align-wrapper btn-text">
              {this.props.text}
            </span>
          </div>
        </a>
    );
  }
}
