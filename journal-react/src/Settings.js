/**
 * Created by Anoxic on 6/5/2017.
 *
 * A view for the settings
 */

import React, {Component} from "react";

import Button from "./Button";
import OneDriveManager from "./OneDriveManager";
import Toggle from "./Toggle";
import NoScrollArea from "./NoScrollArea";

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
    let {value} = e.target;

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

/**
 * To add a new setting to be uploaded:
 * 1. Add the appropriate html code in render()
 * 2. Add the default value in `DEFAULT_SETTINGS_STATE`
 * 3. Add appropriate behavior when it needs to update this.state
 * 4. In `MainContent.js`:
 *    - If applicable (anything other than this.state.settings) needed to be
 *      changed, do it in `handleSettingsSave`. This function is called every
 *      time new settings are saved
 *    - If applicable, also add something new in `applySettings` of
 *      MainContent.js. This function is called every time a new settings is
 *      introduced from the server
 * 5. If a default value is preferred, and it in `DEFAULT_SETTINGS` of
 * MainContent.js
 */

const DEFAULT_SETTINGS_STATE = {
  password       : "",
  passwordConfirm: "",
  passwordEnabled: false,

  bulbMapCenter: {
    latitude : 0,
    longitude: 0,
  },

  bulbAttachLocation: false,
};

export default class Settings extends Component {

  version = 0;

  constructor(props) {
    super(props);

    this.state = Object.assign({
      isLoadingMissingImages: false,
      isEmptyingQueueFolder : false,
      isSaving              : false,
    }, R.copy(DEFAULT_SETTINGS_STATE));

    this.handleMissingImages = this.handleMissingImages.bind(this);
    this.handleLocationInputChange = this.handleLocationInputChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetDefaultLocationClick = this.handleSetDefaultLocationClick.bind(
        this);
    this.handleSave = this.handleSave.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.validateSettings = this.validateSettings.bind(this);
    this.generateSettingsData = this.generateSettingsData.bind(this);
    this.emptyQueueFolder = this.emptyQueueFolder.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (!nextState.passwordEnabled) {
      nextState.password = "";
      nextState.passwordConfirm = "";
    }

    if (nextProps.version > this.version) {
      this.version = nextProps.version;

      // Apply settings from props
      nextState.passwordEnabled = !!nextProps.data.password;
      nextState.passwordConfirm = nextProps.data.password;

      let keys = Object.keys(nextProps.data);
      for (let key of keys) {
        if (typeof nextProps.data[key] === "object") {
          nextState[key] = R.copy(nextProps.data[key]);
        } else {
          nextState[key] = nextProps.data[key];
        }
      }
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
        .catch(() => {
          this.setState({
            isLoadingMissingImages: false,
          });
        });
  }


  handleLocationInputChange(e) {
    let center = this.state.bulbMapCenter;
    center[e.target.name] = parseFloat(e.target.value, 10);

    this.setState({
      bulbMapCenter: center,
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
        bulbMapCenter: {
          latitude : crd.latitude,
          longitude: crd.longitude,
        }
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
    let settings = {};

    let keys = Object.keys(this.props.data);
    for (let key of keys) {
      if (typeof this.state[key] === "object") {
        settings[key] = R.copy(this.state[key]);
      } else {
        settings[key] = this.state[key];
      }
    }

    return settings;
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

  handleToggle(e) {
    let {tag} = e.target.dataset;

    this.setState({
      [tag]: !this.state[tag],
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
          <NoScrollArea
              backgroundColor="#eeeced">
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
                                      name="latitude"
                                      value={this.state.bulbMapCenter.latitude}
                                      min={-180}
                                      max={180}
                                      onChange={this.handleLocationInputChange}
                          />
                        </div>
                        <p className="input-label">Longitude</p>
                        <div className="flex-center">
                          <DigitInput className="normal underlined"
                                      name="longitude"
                                      value={this.state.bulbMapCenter.longitude}
                                      min={-90}
                                      max={90}
                                      onChange={this.handleLocationInputChange}
                          />
                        </div>
                      </FormContent>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="title-dark flex-center">Bulb</div>
                    <div className="form-contents">
                      <FormContent
                          title="Bulb will include your location by default">
                        <Toggle
                            data-tag="bulbAttachLocation"
                            onClick={this.handleToggle}
                            isChanging={this.state.bulbAttachLocation}
                            firstIcon="check_box_outline_blank"
                            secondIcon="check_box"/>
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
                        <Toggle
                            data-tag="passwordEnabled"
                            onClick={this.handleToggle}
                            isChanging={this.state.passwordEnabled}
                            firstIcon="check_box_outline_blank"
                            secondIcon="check_box"/>
                      </FormContent>
                      <FormContent
                          subTitle
                          className={this.state.passwordEnabled ? "" : "hidden"}
                          title="By default, your journal content is not encrypted on your OneDrive account. This means that anyone that may access your OneDrive can also easily find and read what you write. By enabling password protection, Trak will encrypt your data using AES with the password you provide before uploading to your OneDrive. As a result, the next time you sign in, you will need to use the same password to decrypt it. Please note that Trak does not have its own server, so YOU ARE RESPONSIBLE FOR REMEMBERING THE PASSWORD: IF YOU LOST IT, THERE IS NO WAY TO RETRIEVE IT">
                        <span></span>
                      </FormContent>
                      <FormContent
                          className={this.state.passwordEnabled ? "" : "hidden"}
                      >
                        <p className="input-label">Password</p>
                        <div className="flex-center">
                          <input
                              className={`normal underlined password ${this.state.password === this.state.passwordConfirm ? "" : "red"}`}
                              name="password"
                              type="password"
                              value={ this.state.password}
                              onChange={this.handleChange}
                          />
                        </div>
                      </FormContent>
                      <FormContent
                          className={(this.state.passwordEnabled) ? "" : "hidden"}
                      >
                        <p className="input-label">Confirm password</p>
                        <div className="flex-center">
                          <input
                              className={`normal underlined password ${this.state.password === this.state.passwordConfirm ? "" : "red"}`}
                              name="passwordConfirm"
                              type="password"
                              value={this.state.passwordConfirm}
                              onChange={this.handleChange}
                          />
                        </div>
                      </FormContent>
                    </div>
                  </div>
                </div>
                <div className="form shadow">
                  <div className="form-row">
                    <div className="title-dark flex-center">Last built</div>
                    <div className="form-contents">
                      <FormContent
                          title={document.lastModified}>
                        <span></span>
                      </FormContent>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </NoScrollArea>
        </div>
    );
  }
}
