/**
 * Created by Anoxic on 5/28/2017.
 *
 * The whole app starts here
 */

import React, {Component} from "react";
import Button from "./Button";
import MainContent from "./MainContent";

export default class Trak extends Component {

  constructor(props) {
    super(props);

    this.state = {
      signedIn: false,
    }
  }

  render() {
    return (
        <div className={`trak ${this.state.signedIn ? "hidden" : ""}`}>
          <div className="intro flex-center">
            <div className="background"></div>
            <div className="title">TRAK</div>
            <div className="description">An online journal tool, stored in your
              own personal OneDrive
            </div>
            <Button className="accent" text="Sign in">account_box</Button>
            <Button className="about"
                    text="About me"
                    onClick={() => window.open("http://anoxic.me")}>supervisor_account</Button>
          </div>
          <MainContent hidden={!this.state.signedIn}/>
        </div>
    );
  }
}

