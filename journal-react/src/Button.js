/**
 * Created by Anoxic on 042317.
 * A simple class for a button
 */

import React, {Component} from "react";
import Ink from "react-ink";

import "./Button.css";

export default class Button extends Component {
  render() {
    return (
        <a className={`vertical-align btn ${this.props.className || ""}`}>
          <Ink/>
          <i className="material-icons vertical-align-wrapper">{this.props.children}</i>
        </a>
    );
  }
}
