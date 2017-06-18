/**
 * Created by Anoxic on 6/5/2017.
 *
 * A view for the settings
 */

import React, {Component} from "react";

import Button from "./Button";
import OneDriveManager from "./OneDriveManager";
import Toggle from "./Toggle";

import R from "./R";


class FormContent extends Component {
  render() {
    return (
        <div className={`form-content ${this.props.className || ""}`}>
          <div
              className={`description ${this.props.subTitle ? "sub-title" : ""}`}>{this.props.title}</div>
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
               name={this.props.name}
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

      password       : null,
      passwordConfirm: null,
      passwordEnabled: undefined,

      bulbMapCenterLatitude : NaN,
      bulbMapCenterLongitude: NaN,
    };

    this.handleMissingImages = this.handleMissingImages.bind(this);
    this.handleNumberInputChange = this.handleNumberInputChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetDefaultLocationClick = this.handleSetDefaultLocationClick.bind(
        this);
    this.handleSave = this.handleSave.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleTogglePasswordEnabled = this.handleTogglePasswordEnabled.bind(
        this);
    this.validateSettings = this.validateSettings.bind(this);
    this.generateSettingsData = this.generateSettingsData.bind(this);
    this.emptyQueueFolder = this.emptyQueueFolder.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.data.password !== this.props.data.password) {
      nextState.passwordEnabled = !!nextProps.data.password;
    }
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


  handleNumberInputChange(e) {
    this.setState({
      [e.target.name]: parseFloat(e.target.value, 10),
    });
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSetDefaultLocationClick() {
    navigator.geolocation.getCurrentPosition(pos => {
      let crd = pos.coords;

      this.setState({
        bulbMapCenterLatitude : crd.latitude,
        bulbMapCenterLongitude: crd.longitude,
      });
    }, err => {
      console.error(`ERROR(${err.code}): ${err.message}`);

      R.notifyError(this.props.notificationSystem,
          "Unable to get current location. Did you grant access?");
    }, {
      enableHighAccuracy: true,
      maximumAge        : 0,
    });
  }

  validateSettings() {
    if (this.state.password !== this.state.passwordConfirm) {
      R.notifyError(this.props.notificationSystem,
          "Password does not match. No changes are saved. ");
      return false;
    }

    return true;
  }

  generateSettingsData() {
    let password = "";
    if (typeof this.state.passwordEnabled === "undefined") {
      password = this.props.data.password;
    } else if (this.state.passwordEnabled) {
      password = this.state.password;
    }

    return {
      password     : password,
      bulbMapCenter: {
        latitude : isNaN(this.state.bulbMapCenterLatitude) ?
            this.props.data.bulbMapCenter.latitude : this.state.bulbMapCenterLatitude,
        longitude: isNaN(this.state.bulbMapCenterLongitude) ?
            this.props.data.bulbMapCenter.longitude : this.state.bulbMapCenterLongitude,
      },
    };
  }

  handleSave() {
    this.setState({
      isSaving: true,
    });

    if (!this.validateSettings()) {
      this.setState({
        isSaving: false,
      });
      return;
    }

    let data = this.generateSettingsData();

    this.props.onSave(data)
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

  handleTogglePasswordEnabled() {
    let enabled = typeof this.state.passwordEnabled === "undefined" ? this.props.data.password : this.state.passwordEnabled;

    if (!enabled) {
      this.setState({
        passwordEnabled: true,
      });
    } else {
      this.setState({
        passwordEnabled: false,
      });
    }
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

  handleSignOut() {
    // Clear all the cache
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

    // Reload the website
    window.location.reload(true);
  }

  render() {
    return (
        <div className="flex-center settings bg-grey">
          <header className="main-header flex-center">
            <div className="btns">
              <Button className="dark align-right"
                      onClick={this.handleSave}
                      loading={this.state.isSaving}
                      text="save">save</Button>
            </div>
          </header>
          <div className="content flex-center">
            <div className="settings-wrapper">
              <div className="form shadow">
                <div className="form-title">Content</div>
                <div className="form-row">
                  <div className="title-dark flex-center">Images</div>
                  <div className="form-contents">
                    <FormContent
                        title="Lost some images when you deleted them?">
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
                  <div className="form-contents">
                    <FormContent title="">
                      <Button
                          text="sign out"
                          onClick={this.handleSignOut}
                      >exit_to_app</Button>
                    </FormContent>
                  </div>
                </div>
              </div>
              <div className="form shadow">
                <div className="form-title">Personalization</div>
                <div className="form-row">
                  <div className="title-dark flex-center">Bulb Map</div>
                  <div className="form-contents">
                    <FormContent
                        title="Set the default center of the bulb map">
                      <Button
                          onClick={this.handleSetDefaultLocationClick}
                          text="get location"
                          tooltip="Set as current location">
                        my_location
                      </Button>
                    </FormContent>
                    <FormContent>
                      <p className="input-label">Latitude</p>
                      <div className="flex-center">
                        <DigitInput className="normal underlined"
                                    name="bulbMapCenterLatitude"
                                    value={isNaN(this.state.bulbMapCenterLatitude) ? this.props.data.bulbMapCenter.latitude : this.state.bulbMapCenterLatitude}
                                    min={-180}
                                    max={180}
                                    onChange={this.handleNumberInputChange}
                        />
                      </div>
                      <p className="input-label">Longitude</p>
                      <div className="flex-center">
                        <DigitInput className="normal underlined"
                                    name="bulbMapCenterLongitude"
                                    value={isNaN(this.state.bulbMapCenterLongitude) ? this.props.data.bulbMapCenter.longitude : this.state.bulbMapCenterLongitude}
                                    min={-90}
                                    max={90}
                                    onChange={this.handleNumberInputChange}
                        />
                      </div>
                    </FormContent>
                  </div>
                </div>
              </div>
              <div className="form shadow">
                <div className="form-title">Security</div>
                <div className="form-row">
                  <div className="title-dark flex-center">Data</div>
                  <div className="form-contents">
                    <FormContent
                        title="Encrypt your data with password">
                      <Toggle onClick={this.handleTogglePasswordEnabled}
                              isChanging={this.state.passwordEnabled}
                              firstIcon="check_box_outline_blank"
                              secondIcon="check_box"/>
                    </FormContent>
                    <FormContent
                        subTitle
                        className={(typeof this.state.passwordEnabled === "undefined" ? this.props.data.password : this.state.passwordEnabled) ? "" : "hidden"}
                        title="By default, your journal content is not encrypted on your OneDrive account. This means that anyone that may access your OneDrive can also easily find and read what you write. By enabling password protection, Trak will encrypt your data using AES with the password you provide before uploading to your OneDrive. This means that the next time you sign in, you will need to use the same password to decrypt it. Please note that Trak does not have its own server, so YOU ARE RESPONSIBLE FOR REMEMBERING THE PASSWORD: IF YOU LOST IT, THERE IS NO WAY TO RETRIEVE IT">
                      <span></span>
                    </FormContent>
                    <FormContent
                        className={(typeof this.state.passwordEnabled === "undefined" ? this.props.data.password : this.state.passwordEnabled) ? "" : "hidden"}
                    >
                      <p className="input-label">Password</p>
                      <div className="flex-center">
                        <input
                            className={`normal underlined password ${this.state.password === this.state.passwordConfirm ? "" : "red"}`}
                            name="password"
                            type="password"
                            value={this.state.password === null ? this.props.data.password : this.state.password}
                            onChange={this.handleChange}
                        />
                      </div>
                    </FormContent>
                    <FormContent
                        className={(typeof this.state.passwordEnabled === "undefined" ? this.props.data.password : this.state.passwordEnabled) ? "" : "hidden"}
                    >
                      <p className="input-label">Confirm password</p>
                      <div className="flex-center">
                        <input
                            className={`normal underlined password ${this.state.password === this.state.passwordConfirm ? "" : "red"}`}
                            name="passwordConfirm"
                            type="password"
                            value={this.state.passwordConfirm === null ? this.props.data.password : this.state.passwordConfirm}
                            onChange={this.handleChange}
                        />
                      </div>
                    </FormContent>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}
