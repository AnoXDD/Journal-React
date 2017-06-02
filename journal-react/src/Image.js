/**
 * Created by Anoxic on 042917.
 * My personal image class. This image will animate when the new image is set
 */

import React, {Component} from "react";

export default class Image extends Component {
  toggle = false;
  lastSrc = this.props.src;

  shouldComponentUpdate(nextProps) {
    return nextProps.src !== this.props.src;
  }

  componentWillUpdate(nextProps) {
    this.lastSrc = this.props.src;
  }

  componentDidUpdate() {
    this.toggle = !this.toggle;
  }

  render() {
    let className = `Image ${this.toggle ? "toggle" : ""} ${this.props.className || ""}`;

    if (this.props.blank) {
      return (
          <div className={className}>
            <img className="image center" src={this.lastSrc} alt=""/>
            <img className="image center" src={this.props.src}
                 onClick={this.props.onClick}
                 alt=""/>
          </div>
      );
    }

    // Fill the entire thing
    return (
        <div className={className}
             onClick={this.props.onClick}
        >
          <div className={`image ${!this.props.contain ? "stretch" : "contain"}`}
               style={{backgroundImage: `url("${this.lastSrc}")`}}></div>
          <div className={`image ${!this.props.contain ? "stretch" : "contain"}`}
               onClick={this.props.onClick}
               style={{backgroundImage: `url("${this.props.src}")`}}></div>
        </div>
    );
  }
}
