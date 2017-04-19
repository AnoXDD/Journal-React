/**
 * Created by Anoxic on 041817.
 * A toggle with material icon that has two state
 */

import React, {Component} from "react";
import Ink from "react-ink";

import "./Toggle.css";

export default class Toggle extends Component {
 
  state = { 
    onFirst: true
  };

  render() {
    let {className, isChangingOnHover, isChanging, onClick, height, firstIcon, secondIcon} = this.props;

    height = height || "50px";

    return (
        <a className={`vertical-align toggle ${className || ""} ${isChangingOnHover ? "change-hover" : ""} ${isChanging ? "show-second" : ""} `}
           onClick={onClick}
           style={{height: height}}
        >
          <Ink/>
          <i className="vertical-align-wrapper first material-icons">{firstIcon}</i>
          <i className="vertical-align-wrapper second material-icons"
             style={{bottom: height}}>{secondIcon}</i>
        </a>
    );
  }
}