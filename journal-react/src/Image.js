/**
 * Created by Anoxic on 042917.
 * My personal image class. This image will animate when the new image is set
 */

import React, {Component} from "react";

export default class Image extends Component {
  toggle = false;
  lastSrc = this.props.src;

  constructor(props) {
    super(props);

    this.state = {
      isFullscreen: false,
    };

    this.handleClick = this.handleClick.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.src !== this.props.src || this.state.isFullscreen !== nextState.isFullscreen;
  }

  componentWillUpdate(nextProps, nextState) {
    this.lastSrc = this.props.src;
    if (this.state.isFullscreen === nextState.isFullscreen) {
      this.toggle = !this.toggle;
    }
  }

  componentDidUpdate(prevProps, prevState) {

  }

  handleClick(e) {
    if (this.props.onClick) {
      // Toggle fullscreen
      this.setState({
        isFullscreen: !this.state.isFullscreen,
      });

      e.stopPropagation();
    }
  }

  render() {
    let className = `Image ${this.toggle ? "toggle" : ""} ${this.props.className || ""} ${this.state.isFullscreen ? "fullscreen" : ""}`;

    if (this.props.blank) {
      return (
          <div className={className}
              {...(this.state.isFullscreen ? {onClick: this.handleClick} : {})}>
            <img className="image center" src={this.lastSrc} alt=""/>
            <img className="image center" src={this.props.src}
                 onClick={this.handleClick}
                 alt=""/>
          </div>
      );
    }

    // Fill the entire thing
    return (
        <div className={className}
             onClick={this.handleClick}
        >
          <div
              className={`image ${!this.props.contain ? "stretch" : "contain"}`}
              style={{backgroundImage: `url("${this.lastSrc}")`}}></div>
          <div
              className={`image ${!this.props.contain ? "stretch" : "contain"}`}
              onClick={this.handleClick}
              style={{backgroundImage: `url("${this.props.src}")`}}></div>
        </div>
    );
  }
}
