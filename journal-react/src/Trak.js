/**
 * Created by Anoxic on 5/28/2017.
 *
 * The whole app starts here
 */

import React, {Component} from "react";
import Button from "./Button";
import MainContent from "./MainContent";
import OneDriveManager from "./OneDriveManager";

export default class Trak extends Component {

  constructor(props) {
    super(props);

    this.state = {
      signedIn   : false,
      signingIn  : false,
      signInError: "",
    };
  }

  componentDidMount() {
    OneDriveManager.silentSignIn()
        .then(() => {
          this.setState({
            signedIn: true,
          });
        })
  }

  handleSignIn() {
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
            signingIn  : false,
          });
        });
  }

  render() {
    return (
        <div className="trak">
          <div
              className={`intro flex-center ${this.state.signedIn ? "hidden" : ""}`}>
            <div className="background"></div>
            <div className="title">Trak</div>
            <div className="description">An online journal tool, stored in your
              own personal OneDrive
            </div>
            <Button className="accent" text="Sign in"
                    loading={this.state.signingIn}
                    onClick={this.handleSignIn.bind(this)}>account_box</Button>
            <div className={`error ${this.state.signInError ? "" : "hidden"}`}>
              {this.state.signInError}
            </div>
            <Button className="dark about"
                    text="About me"
                    onClick={() => window.open("http://anoxic.me")}>supervisor_account</Button>
          </div>
          { this.state.signedIn ? <MainContent/> : null }
        </div>
    );
  }
}

