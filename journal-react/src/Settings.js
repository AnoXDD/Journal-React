/**
 * Created by Anoxic on 6/5/2017.
 *
 * A view for the settings
 */

import React, {Component} from "react";

import Button from "./Button";

export default class Settings extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoadingMissingImages: false,
    };

    this.handleMissingImages = this.handleMissingImages.bind(this);
  }

  componentShouldUpdate(nextProps) {
    return !(this.props.hidden && nextProps.hidden);
  }

  handleMissingImages() {
    this.setState({
      isLoadingMissingImages: true,
    });

    this.props.handleMissingImages.then(() => {
          this.setState({
            isLoadingMissingImages: false,
          });
        })
        .catch(()=> {
          this.setState({
            isLoadingMissingImages: false,
          });
        });
  }

  render() {
    return (
        <div className="flex-center settings">
          <div className="form">
            <div className="form-row">
              <div className="title-dark flex-center">Missing images</div>
              <p className="flex-center">Missing images? Click to fix them</p>
              <Button onClick={this.handleMissingImages}
                      loading={this.state.isLoadingMissingImages}
              >search</Button>
            </div>
          </div>
        </div>
    );
  }
}
