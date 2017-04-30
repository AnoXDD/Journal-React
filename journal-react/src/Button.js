/**
 * Created by Anoxic on 042317.
 * A simple class for a button
 */

import React, {Component} from "react";
import Ink from "react-ink";

export default class Button extends Component {
  render() {
    return (
        <a className={`vertical-align btn ${this.props.text ? "text": ""} ${this.props.className || ""}`}
           onClick={this.props.onClick || void(0)}>
          <Ink/>
          <i className="material-icons vertical-align-wrapper">{this.props.children}</i>
          <span className="btn-text">{this.props.text}</span>
        </a>
    );
  }
}
