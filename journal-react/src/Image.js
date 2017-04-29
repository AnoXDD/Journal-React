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
    if (this.props.blank) {
      return (
          <div className={`Image ${this.toggle ? "toggle" : ""}`}>
            <img className="image center" src={this.lastSrc} alt/>
            <img className="image center" src={this.props.src}
                 onClick={this.props.onClick}
                 alt/>
          </div>
      );
    }

    // Fill the entire thing
    return (
        <div className={`Image ${this.toggle ? "toggle" : ""}`}
             onClick={this.props.onClick}
        >
          <div className="image stretch"
               style={{backgroundImage: `url("${this.lastSrc}")`}}></div>
          <div className="image stretch"
               onClick={this.props.onClick}
               style={{backgroundImage: `url("${this.props.src}")`}}></div>
        </div>
    );
  }
}
