/**
 * Created by Anoxic on 6/5/2017.
 *
 * A view for the settings
 */

import React, {Component} from "react";

import Button from "./Button";
import OneDriveManager from "./OneDriveManager";

import R from "./R";


class FormContent extends Component {
  render() {
    return (
        <div className="form-content">
          <div className="description">{this.props.title}</div>
          <div className="btns">{this.props.children}</div>
        </div>
    );
  }
}

export default class Settings extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoadingMissingImages: false,
      isEmptyingQueueFolder : false,
    };

    this.handleMissingImages = this.handleMissingImages.bind(this);
    this.emptyQueueFolder = this.emptyQueueFolder.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return !(this.props.hidden && nextProps.hidden);
  }

  handleMissingImages() {
    this.setState({
      isLoadingMissingImages: true,
    });

    this.props.handleMissingImages()
        .then(() => {
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

  emptyQueueFolder() {
    this.setState({
      isEmptyingQueueFolder: true,
    });

    OneDriveManager.emptyQueueFolder()
        .then(() => {
          R.notify(this.props.notificationSystem, "Images are removed");

          this.setState({
            isEmptyingQueueFolder: false,
          });
        })
        .catch(err => {
          R.notifyError(this.props.notificationSystem,
              "There was an error when deleting the image. Try again");
          console.error(err.stack);

          this.setState({
            isEmptyingQueueFolder: false,
          });
        })
  }

  render() {
    return (
        <div className="flex-center settings bg-grey">
          <div className="settings-wrapper shadow">
            <div className="form">
              <div className="form-row">
                <div className="title-dark flex-center">Images</div>
                <div className="form-contents">
                  <FormContent title="Lost some images when you deleted them?">
                    <Button
                        text="fix"
                        onClick={this.handleMissingImages}
                        loading={this.state.isLoadingMissingImages}
                    >build</Button>
                  </FormContent>
                  <FormContent
                      title="Remove all the images that don't belong to anything">
                    <Button
                        text="clean"
                        onClick={this.emptyQueueFolder}
                        loading={this.state.isEmptyingQueueFolder}
                    >delete</Button>
                  </FormContent>
                </div>
              </div>
              <div className="form-row">
                <div className="title-dark flex-center">User</div>
                <FormContent title="">
                  <Button
                      text="sign out"
                      onClick={this.props.signOut}
                  >exit_to_app</Button>
                </FormContent>
              </div>
            </div>
          </div>
        </div>
    );
  }
}
