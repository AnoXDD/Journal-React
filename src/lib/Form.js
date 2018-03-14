/**
 * Created by Anoxic on 9/3/2017.
 *
 * A class for creating a form
 */

import React, {Component} from 'react';
import Button from "./Button";
import Toggle from "./Toggle";
import FormConstants from "./FormConstants";

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
        {this.props.data.map((form, formIndex) =>
          <div key={formIndex} className="form shadow">
            {form.title ? <div className="form-title">{form.title}</div> : null}
            {!form.rows.map ? form.rows : form.rows.map((row, rowIndex) =>
              <div key={`${formIndex}-${rowIndex}`} className="form-row">
                <div className="title-dark flex-center">{row.title}</div>
                <div className="form-contents">
                  {!row.content.map ? row.content
                    : row.content.map((content, contentIndex) =>
                      <FormContent
                        key={`${formIndex}-${rowIndex}-${contentIndex}`}
                        className={content.className}
                        title={content.title}
                        subTitle={!!content.subTitle}
                      >
                        {!content.elements.map ? content.elements
                          : content.elements.map(
                            (elem, elemIndex) => {
                              let label = "",
                                props = {};

                              switch (elem.type) {
                                case FormConstants.NONE:
                                  return (<span key={elemIndex}></span>);

                                case FormConstants.PLAIN_TEXT:
                                  return (
                                    <p key={elemIndex} className="plain-text">
                                      {elem.props}
                                    </p>
                                  );

                                case FormConstants.TOGGLE:
                                  return (
                                    <Toggle key={elemIndex} {...elem.props}/>);

                                case FormConstants.BUTTON:
                                  return (
                                    <Button key={elemIndex} {...elem.props}/>
                                  );

                                case FormConstants.INPUT:
                                  ({label, ...props} = elem.props);
                                  return ([
                                    <p key={`${elemIndex}-p`} className="input-label">{label}</p>,
                                    <div key={`${elemIndex}-div`} className="flex-center">
                                      <input {...props}/>
                                    </div>
                                  ]);

                                case FormConstants.DIGIT_INPUT:
                                  ({label, ...props} = elem.props);
                                  return ([
                                    <p key={`${elemIndex}-p`} className="input-label">{label}</p>,
                                    <div key={`${elemIndex}-div`} className="flex-center">
                                      <DigitInput {...props}/>
                                    </div>
                                  ]);

                                default:
                                  return null;
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