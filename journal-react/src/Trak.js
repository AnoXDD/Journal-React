/**
 * Created by Anoxic on 5/28/2017.
 *
 * The whole app starts here
 */

import React, {Component} from "react";
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
        <div className="trak">
          <div className="intro flex-center">

          </div>
          <MainContent hidden={!this.state.signedIn}/>
        </div>
    )
  }
}

