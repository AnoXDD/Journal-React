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

    this.props.handleMissingImages().then(() => {
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
        <div className="flex-center settings bg-grey">
          <div className="settings-wrapper shadow">
            <div className="form">
              <div className="form-row">
                <div className="title-dark flex-center">Image management</div>
                <div className="btns">
                  <Button
                      text="fix missing images"
                      onClick={this.handleMissingImages}
                      loading={this.state.isLoadingMissingImages}
                  >build</Button>
                  <Button
                      text="delete unused images"
                      onClick={this.handleMissingImages}
                      loading={this.state.isLoadingMissingImages}
                  >delete</Button>
                </div>
              </div>
              <div className="form-row">
                <div className="title-dark flex-center">User</div>
                <div className="btns">
                  <Button
                      text="sign out"
                      onClick={this.props.signOut}
                  >exit_to_app</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}
