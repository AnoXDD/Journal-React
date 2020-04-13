// @flow strict-local

/**
 * Created by Anoxic on 6/4/2017.
 * A loading screen with progress bar and title
 */

import Button from "./lib/Button";
import ProgressBar from "./ProgressBar";
import Prompt from "./lib/Prompt";

import * as React from "react";

type Props = {|
  +title: string,
  +requirePassword: boolean,
  +handlePassword: (password: string) => void,
  +progress: number,
|};

type State = {|
  password: string,
|};

export default class LoadingScreen extends React.Component<Props, State> {

  input: ?React.ElementRef<"input"> = null;

  state: State = {
    password: "",
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.title !==
      "" ||
      this.props.title !==
      "" ||
      this.props.requirePassword;
  }

  componentDidUpdate(prevProps: Props): void {
    if (this.props.requirePassword && !prevProps.requirePassword) {
      // The new loading screen is prompting for password
      this.input && this.input.focus();
    }
  }

  handlePassword = (): void => {
    if (this.state.password) {
      this.props.handlePassword(this.state.password);

      this.setState({
        password: "",
      });
    }
  };

  handleChange = (e: SyntheticInputEvent<>): void => {
    this.setState({
      password: e.target.value,
    });
  };

  handleKeyDown = (e: SyntheticKeyboardEvent<>): void => {
    if (e.key === "Enter") {
      // Send the bulb
      this.handlePassword();

      e.preventDefault();
    }
  };

  render() {
    if (this.props.title === "" && !this.props.requirePassword) {
      return null;
    }

    return (
      <div className="loading-screen flex-center">
        <Button className="dark" loading={true}>clear</Button>
        <div className="title">{this.props.title}</div>
        <ProgressBar progress={this.props.progress}/>
        <Prompt
          className={`dim-bg flex-center bulb-prompt ${this.props.requirePassword ? "" : "hidden"}`}>
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
                       ref={ref => this.input = ref}
                />
              </div>
              <div
                className="message error flex-center">{this.props.title}</div>
            </div>
          </div>
        </Prompt>
      </div>
    );
  }
}
