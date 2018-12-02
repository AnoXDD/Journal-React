// @flow strict-local

/**
 * Created by Anoxic on 6/6/2017.
 *
 * Just a progress bar
 */

import * as React from "react";

type Props = {|
  +className?: string,
  +progress: number,
|};

export default class ProgressBar extends React.Component<Props> {
  render(): React.Node {
    return (
      <div className={`progress-bar ${this.props.className || ""}`}>
            <span className="progress"
                  style={{
                    left      : `${(this.props.progress || 0) * 100}%`,
                    transition: this.props.progress === 0 ? "none" : undefined
                  }}></span>
      </div>
    );
  }
}

