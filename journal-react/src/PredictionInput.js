/**
 * Created by Anoxic on 042017.
 */

import React, {Component} from 'react';

import "./PredictionInput.css";

export default class PredictionInput extends Component {

  state = {
    tagPrediction: ""
  };

  candidates = this.props.candidates.split(" ");

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.getPrediction = this.getPrediction.bind(this);
  }


  handleChange(event) {
    this.setState({
      tagPrediction: this.getPrediction(event.target.value),
    });
  }

  getPrediction(value) {
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

  handleKeyDown(e) {
    this.props.onKeyDown(e, this.state.tagPrediction);
    this.handleChange(e);
  }

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