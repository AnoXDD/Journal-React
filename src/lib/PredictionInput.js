// @flow strict-local

/**
 * Created by Anoxic on 042017.
 */

import * as React from "react";

type Props = {|
  +blacklist: Array<string>,
  +candidates: Array<string>,
  +className: string,
  +inputClassName: string,
  +onKeyDown: (e: SyntheticKeyboardEvent<>, prediction: string) => void,
|};

type State = {|
  tagPrediction: string,
|};

export default class PredictionInput extends React.Component<Props, State> {

  state: State = {
    tagPrediction: "",
  };

  candidates: Array<string> = this.props.candidates;

  componentWillUpdate(nextProps: Props): void {
    if (nextProps.candidates !== this.props.candidates) {
      this.candidates = nextProps.candidates;
    }
  }

  handleChange = (event: SyntheticKeyboardEvent<>): void => {
    const {target} = event;

    if (target instanceof HTMLInputElement) {
      this.setState({
        tagPrediction: this.getPrediction(target.value),
      });
    }
  };

  getPrediction(value: string): string {
    if (value) {
      for (let prediction of this.candidates) {
        if (prediction.startsWith(value)) {
          if (this.props.blacklist.indexOf(prediction) === -1) {
            return prediction;
          }
        }
      }
    }

    return value;
  }

  handleKeyDown = (e: SyntheticKeyboardEvent<>): void => {
    this.props.onKeyDown(e, this.state.tagPrediction);
    this.handleChange(e);
  };

  render() {
    let {className, inputClassName} = this.props;

    return (
      <span className={`${className || ""} PredictionInput`}>
          <span className="prediction">{this.state.tagPrediction}</span>
          <input
            type="text"
            className={`input ${inputClassName || ""}`}
            onKeyDown={this.handleKeyDown}
            onChange={this.handleChange}/>
        </span>
    );
  }
}