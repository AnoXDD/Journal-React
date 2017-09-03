/**
 * Created by Anoxic on 9/3/2017.
 *
 * A class for creating a form
 */

import React, {Component} from 'react';
import Button from "./Button";
import Toggle from "./Toggle";

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

module.exports = {
  type: {
    NONE       : 1,
    PLAIN_TEXT : 2,
    TOGGLE     : 3,
    BUTTON     : 4,
    INPUT      : 5,
    DIGIT_INPUT: 6,
  }
};

export default class Form extends Component {

  render() {
    return (
      <div className={`form ${this.props.className || ""}`}>
        {this.props.data.map(form =>
          <div className="form shadow">
            <div className="form-title">{form.content}</div>
            {!form.row.map ? form.row : form.row.map(row =>
              <div className="form-row">
                <div className="title-dark flex-center">{row.title}</div>
                <div className="form-contents">
                  {!row.content.map ? row.content : row.content.map(content =>
                    <FormContent
                      className={content.className}
                      title={content.title} {content.subTitle}>
                      {!content.elements.map ? content.elements
                        : content.elements.map(
                          elem => {
                            switch (elem.type) {
                              case Form.type.NONE:
                                return (<span></span>);

                              case Form.type.PLAIN_TEXT:
                                return (
                                  <p className="plain-text">elem.props</p>
                                );

                              case Form.type.TOGGLE:
                                return (<Toggle {...elem.props}/>);

                              case Form.type.BUTTON:
                                return (<Button {...elem.props}/>);

                              case Form.type.INPUT:
                                ({label, props} = elem.props);
                                return ([
                                  <p className="input-label">{label}</p>,
                                  <div className="flex-center">
                                    <input {...props}/>
                                  </div>
                                ]);

                              case Form.type.DIGIT_INPUT:
                                ({label, props} = elem.props);
                                return ([
                                  <p className="input-label">{label}</p>,
                                  <div className="flex-center">
                                    <DigitInput {...props}/>
                                  </div>
                                ]);
                            }
                          }
                        )}
                    </FormContent>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}