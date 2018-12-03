// @flow strict-local

/**
 * Created by Anoxic on 5/28/2017.
 *
 * The whole app starts here
 */

import Background from "./Background";
import Button from "./lib/Button";
import MainContent from "./MainContent";
import OneDriveManager from "./OneDriveManager";

import * as React from "react";

type State = {|
  signedIn: boolean,
  signingIn: boolean,
  signInError: string,
|};

export default class Trak extends React.Component<{||}, State> {
  state: State = {
    signedIn: false,
    signingIn: false,
    signInError: "",
  };

  componentDidMount(): void {
    OneDriveManager.silentSignIn()
      .then(() => {
        this.setState({
          signedIn: true,
        });
      });
  }

  handleSignIn(): void {
    this.setState({
      signingIn: true,
    });

    OneDriveManager.signIn()
      .then(() => this.setState({
        signedIn: true,
      }))
      .catch(err => {
        this.setState({
          signInError: err,
          signingIn: false,
        });
      });
  }

  render(): React.Node {
    return (
      <div className="trak">
        <div
          className={`intro flex-center ${this.state.signedIn ? "hidden" : ""}`}>
          <Background/>
          <div className="title">Trak</div>
          <div className="description">An online journal tool, stored in your
            own personal OneDrive
          </div>
          <Button className="accent" text="Sign in"
                  loading={this.state.signingIn}
                  onClick={this.handleSignIn.bind(this)}>account_box</Button>
          <div
            className={`error ${this.state.signInError ? "" : "hidden"}`}>
            {this.state.signInError}
          </div>
          <Button className="dark about"
                  text="About me"
                  onClick={() => window.open("http://anoxic.me")}>supervisor_account</Button>
        </div>
        {this.state.signedIn ? <MainContent/> : null}
      </div>
    );
  }
}

