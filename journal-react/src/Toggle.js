/**
 * Created by Anoxic on 041817.
 * A toggle with material icon that has two state
 */

import React, {Component} from "react";
import Ink from "react-ink";

export default class Toggle extends Component {

  state = {
    onFirst: true
  };

  render() {
    let {className, isHidden, isChangingOnHover, isChanging, onClick, height, firstIcon, secondIcon} = this.props;

    height = height || "50px";

    return (
        <a className={`vertical-align toggle ${this.props.loading ? "loading" : ""} ${className || ""} ${isHidden ? "hidden" : ""} ${isChangingOnHover ? "change-hover" : ""} ${isChanging ? "show-second" : ""} `}
           onClick={onClick}
           style={{height: height}}
        >
          <Ink/>
          <i className="material-icons vertical-align-wrapper loading-icon">remove</i>
          <i className="vertical-align-wrapper first material-icons">{firstIcon}</i>
          <i className="vertical-align-wrapper second material-icons"
             style={{bottom: height}}>{secondIcon}</i>
        </a>
    );
  }
}