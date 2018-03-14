/**
 * Created by Anoxic on 041617.
 */

import React, {Component} from "react";

export default class NoScrollArea extends Component {

  render() {
    let {children, padding, backgroundColor} = this.props;
    padding = padding || "40px";
    backgroundColor = backgroundColor || "white";

    children = React.cloneElement(children, {
      style: {
        paddingTop   : padding,
        paddingBottom: padding,
        paddingRight : "20px",
        width        : "100%",
        height       : `calc(100% - ${padding} - ${padding})`,
        overflowY    : "scroll",
        overflowX    : "hidden",
      }
    });

    return (
        <div className={`no-scroll ${this.props.className || ""}`}
             style={{background: backgroundColor}}>

          <div className="no-scroll-wrapper"
               style={{
                 background: backgroundColor,
               }}
          >
            <span className="before"
                  style={{
                    background: `linear-gradient(to bottom, ${backgroundColor} 0, transparent 100%)`,
                    height: padding
                  }}
            />
            {children}
            <span className="after"
                  style={{
                    background: `linear-gradient(to top, ${backgroundColor} 0, transparent 100%)`,
                    height: padding
                  }}
            />
          </div>

        </div>
    );
  }
}