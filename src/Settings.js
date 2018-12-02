// @flow strict-local

/**
 * Created by Anoxic on 6/5/2017.
 *
 * A view for the settings
 */

import type NotificationSystem from "react-notification-system";

import Button from "./lib/Button";
import OneDriveManager from "./OneDriveManager";
import NoScrollArea from "./lib/NoScrollArea";
import Form from "./lib/Form";

import R from "./R";
import * as FormConstants from "./lib/FormConstants";
import * as React from "react";

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
  password: "",
  passwordConfirm: "",
  passwordEnabled: false,

  bulbMapCenter: {
    latitude: 0,
    longitude: 0,
  },

  bulbAttachLocation: false,
};

type Props = {|
  +data: Data,
  +handleMissingImages: () => Promise<void>,
  +hidden: boolean,
  +notificationSystem: NotificationSystem,
  +onSave: (data: Data) => Promise<void>,
  +version: number,
|};

type State = {|
  bulbAttachLocation: boolean,
  bulbMapCenter: GeoCoordinate,
  isEmptyingQueueFolder: boolean,
  isLoadingMissingImages: boolean,
  isSaving: boolean,
  password: string,
  passwordConfirm: string,
  passwordEnabled: boolean,
|};

export default class Settings extends React.Component<Props, State> {

  version: number = 0;

  state: State = {
    ...R.copy(DEFAULT_SETTINGS_STATE),
    isLoadingMissingImages: false,
    isEmptyingQueueFolder: false,
    isSaving: false,
  };

  componentWillUpdate(nextProps: Props, nextState: State): void {
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

  handleMissingImages = (): void => {
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
  };

  handleLocationInputChange = (e: SyntheticInputEvent<>): void => {
    const {target} = e;
    if (!(
      target instanceof HTMLInputElement
    )) {
      return;
    }

    let center = this.state.bulbMapCenter;
    center[target.name] = parseFloat(target.value);

    this.setState({
      bulbMapCenter: center,
    });
  };

  handleChange = (e: SyntheticInputEvent<>): void => {
    const {target} = e;
    if (!(
      target instanceof HTMLInputElement
    )) {
      return;
    }

    this.setState({
      [target.name]: target.value,
    });
  };

  handleSetDefaultLocationClick = (): void => {
    navigator.geolocation.getCurrentPosition(pos => {
      let crd = pos.coords;

      this.setState({
        bulbMapCenter: {
          latitude: crd.latitude,
          longitude: crd.longitude,
        },
      });
    }, err => {
      console.error(`ERROR(${err.code}): ${err.message}`);

      R.notifyError(
        this.props.notificationSystem,
        "Unable to get current location. Did you grant access?",
      );
    }, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: Infinity,
    });
  };

  validateSettings() {
    if (this.state.password !== this.state.passwordConfirm) {
      R.notifyError(
        this.props.notificationSystem,
        "Password does not match. No changes are saved. ",
      );
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

  handleSave = (): void => {
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
  };

  handleToggle = (e: SyntheticMouseEvent<>): void => {
    const {target} = e;
    if (!(
      target instanceof HTMLElement
    )) {
      return;
    }
    let {tag} = target.dataset;

    this.setState({
      [tag]: !this.state[tag],
    });
  };

  emptyQueueFolder = (): void => {
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
        R.notifyError(
          this.props.notificationSystem,
          "There was an error when deleting the image. Try again",
        );
        console.error(err.stack);

        this.setState({
          isEmptyingQueueFolder: false,
        });
      });
  };

  handleSignOut(): void {
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

  render(): React.Node {
    let data = [
      {
        title: "Content",
        rows: [
          /* New row */
          {
            title: "Images",
            content: [
              {
                title: "Lost some images when you deleted them?",
                elements: [
                  {
                    type: FormConstants.BUTTON,
                    props: {
                      text: "fix",
                      onClick: this.handleMissingImages,
                      loading: this.state.isLoadingMissingImages,
                      icon: "build",
                    },
                  },
                ],
              }, {
                title: "Remove all the images that don't belong to anything",
                elements: [
                  {
                    type: FormConstants.BUTTON,
                    props: {
                      text: "clean",
                      onClick: this.emptyQueueFolder,
                      loading: this.state.isEmptyingQueueFolder,
                      icon: "delete",
                    },
                  },
                ],
              },
            ],
          },
          /* New row */
          {
            title: "User",
            content: [
              {
                title: "",
                elements: [
                  {
                    type: FormConstants.BUTTON,
                    props: {
                      text: "sign out",
                      onClick: this.handleSignOut,
                      icon: "exit_to_app",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },

      /* New form */
      {
        title: "Personalization",
        rows: [
          {
            title: "Bulb Map",
            content: [
              {
                title: "Set the default center of the bulb map",
                elements: [
                  {
                    type: FormConstants.BUTTON,
                    props: {
                      text: "get location",
                      onClick: this.handleSetDefaultLocationClick,
                      tooltip: "Set as current location",
                      icon: "my_location",
                    },
                  },
                ],
              },
              {
                elements: [
                  {
                    type: FormConstants.DIGIT_INPUT,
                    props: {
                      label: "Latitude",
                      className: "normal underlined",
                      name: "latitude",
                      value: this.state.bulbMapCenter.latitude,
                      min: -180,
                      max: 180,
                      onChange: this.handleLocationInputChange,
                    },
                  }, {
                    type: FormConstants.DIGIT_INPUT,
                    props: {
                      label: "Longitude",
                      className: "normal underlined",
                      name: "longitude",
                      value: this.state.bulbMapCenter.longitude,
                      min: -90,
                      max: 90,
                      onChange: this.handleLocationInputChange,
                    },
                  },
                ],
              },
            ],
          },
          /* New row*/
          {
            title: "Bulb",
            content: [
              {
                title: "Bulb will include your location by default",
                elements: [
                  {
                    type: FormConstants.TOGGLE,
                    props: {
                      "data-tag": "bulbAttachLocation",
                      onClick: this.handleToggle,
                      isChanging: this.state.bulbAttachLocation,
                      firstIcon: "check_box_outline_blank",
                      secondIcon: "check_box",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },

      /* New form */
      {
        title: "Security",
        rows: [
          /* New row */
          {
            title: "Data",
            content: [
              {
                title: "Encrypt your data with password",
                elements: [
                  {
                    type: FormConstants.TOGGLE,
                    props: {
                      "data-tag": "passwordEnabled",
                      onClick: this.handleToggle,
                      isChanging: this.state.passwordEnabled,
                      firstIcon: "check_box_outline_blank",
                      secondIcon: "check_box",
                    },
                  },
                ],
              },
              {
                title: "By default, your journal content is not encrypted on your OneDrive account. This means that anyone that may access your OneDrive can also easily find and read what you write. By enabling password protection, Trak will encrypt your data using AES with the password you provide before uploading to your OneDrive. As a result, the next time you sign in, you will need to use the same password to decrypt it. Please note that Trak does not have its own server, so YOU ARE RESPONSIBLE FOR REMEMBERING THE PASSWORD: IF YOU LOST IT, THERE IS NO WAY TO RETRIEVE IT",
                subTitle: true,
                className: this.state.passwordEnabled ? "" : "hidden",
                elements: [
                  {type: FormConstants.NONE},
                ],
              },
              {
                className: this.state.passwordEnabled ? "" : "hidden",
                elements: [
                  {
                    type: FormConstants.INPUT,
                    props: {
                      label: "Password",
                      className: `normal underlined password ${this.state.password ===
                      this.state.passwordConfirm ? "" : "red"}`,
                      name: "password",
                      type: "password",
                      value: this.state.password,
                      onChange: this.handleChange,
                    },
                  },
                ],
              },
              {
                className: this.state.passwordEnabled ? "" : "hidden",
                elements: [
                  {
                    type: FormConstants.INPUT,
                    props: {
                      label: "Confirm password",
                      className: `normal underlined password ${this.state.password ===
                      this.state.passwordConfirm ? "" : "red"}`,
                      name: "passwordConfirm",
                      type: "password",
                      value: this.state.passwordConfirm,
                      onChange: this.handleChange,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },

      /* New form */
      {
        rows: [
          {
            title: "Last built",
            content: [
              {
                title: document.lastModified,
                elements: [
                  {type: FormConstants.NONE},
                ],
              },
            ],
          },
        ],
      },
    ];

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
              <Form className="settings-wrapper" data={data}/>
            </div>
          </div>
        </NoScrollArea>
      </div>
    );
  }
}
