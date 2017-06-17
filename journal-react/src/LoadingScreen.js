/**
 * Created by Anoxic on 6/4/2017.
 * A loading screen with progress bar and title
 */

import React, {Component} from "react";

import Button from "./Button";
import ProgressBar from "./ProgressBar";
import Prompt from "./Prompt";

export default class LoadingScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      password: "",
    };

    this.handlePassword = this.handlePassword.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  shouldComponenUpdate(nextProps) {
    return nextProps.title !== "" || this.props.title !== "";
  }

  handlePassword() {
    if (this.state.password) {
      this.props.handlePassword(this.state.password);

      this.setState({
        password: "",
      });
    }
  }

  handleChange(e) {
    this.setState({
      password: e.target.value,
    });
  }

  handleKeyDown(e) {
    if (e.key === "Enter") {
      // Send the bulb
      this.handlePassword();

      e.preventDefault();
    }
  }

  render() {
    if (this.props.title === "" && !this.props.requirePassword) {
      return null;
    }

    return (
        <div className="loading-screen flex-center">
          <Button className="dark" loading={true}>clear</Button>
          <div className="title">{this.props.title}</div>
          <ProgressBar progress={this.props.progress}/>
          {this.props.requirePassword ? (
              <Prompt className="dim-bg flex-center bulb-prompt">
                <div className="prompt-box shadow">
                  <div className="dialog">
                    <div className="title">Password required</div>
                    <div className="message">Your data is protected with
                      password. Please note that there is no way to retrieve
                      your password, but you can try unlimited amount of
                      times until it is a match
                    </div>
                    <div className="message input-wrapper flex-center">
                      <input className="normal underlined"
                             type="password"
                             value={this.state.password}
                             onChange={this.handleChange}
                             onKeyDown={this.handleKeyDown}
                      />
                      <Button onClick={this.handlePassword}>lock_open</Button>
                    </div>
                    <div
                        className="message error flex-center">{this.props.title}</div>
                  </div>
                </div>
              </Prompt>
          ) : null}
        </div>
    );
  }
}
