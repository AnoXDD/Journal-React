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

    let disabled = {};
    if (this.props.disabled) {
      disabled.disabled = "disabled";
    }

    height = height || "50px";

    return (
        <a className={`toggle ${this.props.loading ? "loading" : ""} ${className || ""} ${isHidden ? "hidden" : ""} ${isChangingOnHover ? "change-hover" : ""} ${isChanging ? "show-second" : ""} `}
           onClick={onClick}
           style={{height: height}}
            {...disabled}
        >
          <Ink/>
          { this.props.tooltip ? (
              <div className="tooltip flex-center">
                <span className="tooltip-text">
                  {this.props.tooltip}
                </span>
              </div>) : null }
          <div
              className={`flex-center icon-wrapper loading-icon ${this.props.loading ? "" : "transparent"}`}>
            <i className="material-icons">
              remove
            </i>
          </div>
          <i className="flex-center first material-icons">{firstIcon}</i>
          <i className="flex-center second material-icons">{secondIcon}</i>
        </a>
    );
  }
}