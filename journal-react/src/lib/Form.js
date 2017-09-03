/**
 * Created by Anoxic on 9/3/2017.
 *
 * A class for creating a form
 */

import React, {Component} from 'react';

class FormContent extends Component {
  render() {
    return (
        <div className={`form-content ${this.props.className || ""}`}>
          <div
              className={`description ${this.props.subTitle ? "sub-title" : ""}`}>{this.props.title}</div>
          <div className="btns">{this.props.children}</div>
        </div>
    );
  }
}

class DigitInput extends Component {

  min = Number.MIN_SAFE_INTEGER;
  max = Number.MAX_SAFE_INTEGER;

  constructor(props) {
    super(props);

    if (typeof props.min === "number") {
      this.min = props.min;
    }

    if (typeof  props.max === "number") {
      this.max = props.max;
    }

    this.state = {
      value: this.props.defaultValue || 0,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    let {value} = e.target;

    if (value > this.max) {
      value = this.max;
    } else if (value < this.min) {
      value = this.min;
    }

    // Use implicit comparison to allow adding dot in the end
    // eslint-disable-next-line
    if (value != parseFloat(value, 10)) {
      e.target.value = parseFloat(value, 10);

      if (isNaN(e.target.value)) {
        e.target.value = 0;
      }
    }

    this.props.onChange(e);

    this.setState({value: e.target.value});
  }

  render() {
    return (
        <input type="text" className={this.props.className || ""}
               name={this.props.name}
               value={this.props.value}
               onChange={this.handleChange}/>
    )
  }
}

export default class Form extends Component {
  render() {
    return (
        <div className={`form ${this.props.className || ""}`}>

        </div>
    );
  }
}
