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
    let {value}  = e.target;

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
               value={this.props.value}
               onChange={this.handleChange}/>
    )
  }
}

export default class Settings extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoadingMissingImages: false,
      isEmptyingQueueFolder : false,
      isSaving              : false,
    };

    this.handleMissingImages = this.handleMissingImages.bind(this);
    this.handleLatitudeChange = this.handleLatitudeChange.bind(this);
    this.handleLongitudeChange = this.handleLongitudeChange.bind(this);
    this.handleSetDefaultLocationClick = this.handleSetDefaultLocationClick.bind(
        this);
    this.handleSave = this.handleSave.bind(this);
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

  handleLatitudeChange(e) {
    let data = R.copy(this.props.data);
    data.bulbMapCenter.latitude = parseFloat(e.target.value, 10);

    this.props.onChange(data);
  }

  handleLongitudeChange(e) {
    let data = R.copy(this.props.data);
    data.bulbMapCenter.longitude = parseFloat(e.target.value, 10);

    this.props.onChange(data);
  }

  handleSetDefaultLocationClick() {
    navigator.geolocation.getCurrentPosition(pos => {
      let data = R.copy(this.props.data),
          crd = pos.coords;

      data.bulbMapCenter = {
        latitude : crd.latitude,
        longitude: crd.longitude,
      };

      this.props.onChange(data);
    }, err => {
      console.error(`ERROR(${err.code}): ${err.message}`);

      R.notifyError(this.props.notificationSystem,
          "Unable to get current location. Did you grant access?");
    }, {
      enableHighAccuracy: true,
      maximumAge        : 0,
    });
  }

  handleSave() {
    this.setState({
      isSaving: true,
    });

    this.props.onSave()
        .then(() => {
          this.setState({
            isSaving: false,
          });
        })
        .catch(err => {
          console.error(err.stack);

          this.setState({
            isSaving: false,
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
          <div className="settings-wrapper">
            <div className="form shadow">
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
            <div className="form shadow">
              <div className="form-title">Personalization</div>
              <div className="form-row">
                <div className="title-dark flex-center">Bulb Map</div>
                <div className="form-contents">
                  <FormContent
                      title="Set the default center of the bulb map">
                    <span></span>
                  </FormContent>
                  <FormContent>
                    <p className="input-label">Latitude</p>
                    <div className="flex-center">
                      <DigitInput className="normal underlined"
                                  value={this.props.data.bulbMapCenter.latitude}
                                  min={-180}
                                  max={180}
                                  onChange={this.handleLatitudeChange}
                      />
                    </div>
                    <p className="input-label">Longitude</p>
                    <div className="flex-center">
                      <DigitInput className="normal underlined"
                                  value={this.props.data.bulbMapCenter.longitude}
                                  min={-90}
                                  max={90}
                                  onChange={this.handleLongitudeChange}
                      />
                    </div>
                    <Button
                        onClick={this.handleSetDefaultLocationClick}
                        text="get location"
                        tooltip="Set as current location">
                      my_location
                    </Button>
                  </FormContent>
                </div>
              </div>
              <div className="form-row button">
                <div className="form-contents">
                  <FormContent title="">
                    <Button className="accent"
                            onClick={this.handleSave}
                            loading={this.state.isSaving}
                            text="save">save</Button>
                  </FormContent>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}
