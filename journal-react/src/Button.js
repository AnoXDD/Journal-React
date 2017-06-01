/**
 * Created by Anoxic on 042317.
 * A simple class for a button
 */

import React, {Component} from "react";
import Ink from "react-ink";

export default class Button extends Component {

  render() {
    let disabled = {};
    if (this.props.disabled || this.props.loading) {
      disabled.disabled = "disabled";
    }

    return (
        <a className={`btn ${this.props.loading ? "loading" : ""} ${this.props.text ? "text": ""} ${this.props.className || ""}`}
           onClick={this.props.onClick || void(0)} {...disabled}>
          <Ink/>
          { this.props.loading ? null : (
              <div className="flex-center icon-wrapper">
                <i className="material-icons">
                  {this.props.children}
                </i>
              </div>)}
          { this.props.text && !this.props.loading ? (
              <div className="vertical-align text-wrapper">
                <span className="vertical-align-wrapper btn-text">
                  {this.props.text}
                </span>
              </div>) : null }
          { this.props.loading ? (
              <div className="flex-center icon-wrapper">
                <i className="material-icons">
                  remove
                </i>
              </div>) : null }
        </a>
    );
  }
}