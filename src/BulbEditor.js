// @flow strict-local

import type NotificationSystem from "react-notification-system";

import * as React from "react";

import NoScrollArea from "./lib/NoScrollArea";
import Button from "./lib/Button";
import Toggle from "./lib/Toggle";
import Prompt from "./lib/Prompt";
import Image from "./lib/Image";
import ImagePicker from "./ImagePicker";
import OneDriveManager from "./OneDriveManager";

import R from "./R";

/**
 * This editor is only appropriate to edit a bulb, NOT for an article, since
 * it's basically a prompt
 */

type Props = {|
  +bulbAttachLocation: boolean,
  +hidden: boolean,
  +notificationSystem: React.ElementRef<Class<NotificationSystem>>,
  +onClose: () => void,
  +onEdit: (bulbContent: string) => void,
  +onSend: (bulbContent: string, imageId: ?{|
    +id: string,
    +name: string,
  |}) => Promise<void>,
|};

type State = {|
  value: string,
  location: string,

  sending: boolean,
  loadingLocation: boolean,
  src: ?string,

  clipboardImage: ?File,
  clipboardImageVersion: number,
|};

export default class BulbEditor extends React.Component<Props, State> {

  /* The last imageId associated with this bulb */
  _id: string = "";
  _name: string = "";
  state: State = {
    value   : "",
    location: "",

    sending        : false,
    loadingLocation: false,
    src            : null,

    clipboardImage       : null,
    clipboardImageVersion: 0,
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    return !this.props.hidden || !nextProps.hidden;
  }

  componentDidUpdate(prevProps: Props): void {
    // Do something when it got popped up
    if (prevProps.hidden && !this.props.hidden) {
      // Ask for focus when it popped up
      this._input && this._input.focus();

      // Get current location if settings say so
      if (this.props.bulbAttachLocation && !this.state.location) {
        this.toggleCurrentLocation();
      }
    }
  }

  toggleCurrentLocation = (): void => {
    if (!this.state.location) {
      this.getCurrentLocation();
    } else {
      this.setState({
        location: "",
      });
    }
  };

  getCurrentLocation = (): void => {
    this.setState({
      loadingLocation: true,
    });

    navigator.geolocation.getCurrentPosition(pos => {
      const crd = pos.coords;

      this.setState({
        location       : ` #[${crd.latitude},${crd.longitude}]`,
        loadingLocation: false,
      });
    }, err => {
      console.error(`ERROR(${err.code}): ${err.message}`);

      R.notifyError(this.props.notificationSystem,
        "Unable to get current location. Did you grant access?");

      this.setState({
        loadingLocation: false,
      });
    }, {
      enableHighAccuracy: true,
      maximumAge        : 0,
      timeout           : Infinity,
    });
  };

  removeAttachedImage = (): void => {
    this._id = "";
    this._name = "";

    this.setState({
      src: null,
    });
  };

  handleEditClick = (): void => {
    let {value} = this.state;

    this.setState({
      value: "",
    });

    this.props.onEdit(value);
  };

  handleKeyDown = (e: SyntheticKeyboardEvent<*>): void => {
    if (e.key === "Enter") {
      // Send the bulb
      this.send();

      e.preventDefault();
    }
  };

  handleFinish = (image: OneDriveItem): Promise<void> => {
    if (this._id) {
      // There is a previous image uploaded, and we want to remove it
      return OneDriveManager.removeItemById(this._id)
        .catch(err => {
          console.error(err.stack);
        })
        .then(() => {
          this._handleFinishPromise(image);
        });
    }

    return new Promise(res => {
      this._handleFinishPromise(image);
      res();
    });
  };

  _handleFinishPromise = (response: OneDriveItem): void => {
    this._id = response.id;
    this._name = response.name;
    this.setState({
      src: response["@microsoft.graph.downloadUrl"],
    });
  };

  handlePaste = (e: SyntheticClipboardEvent<*>): void => {
    if (e.clipboardData.items && e.clipboardData.items.length) {
      let item = e.clipboardData.items[0];

      if (item.type && item.type.match(/image\/*/)) {
        // This is an image
        let file = item.getAsFile();

        this.setState({
          clipboardImage       : file,
          clipboardImageVersion: new Date().getTime(),
        });
      }
    }
  };

  send(): void {
    this.setState({
      sending: true,
    });

    this.props.onSend(this.state.value + this.state.location,
      this._id && this._name ? {id: this._id, name: this._name} : undefined)
      .then(() => {
        this.setState({
          value  : "",
          sending: false,
          src    : "",
        });
      }, () => {
        this.setState({sending: false});
      })
      .then(() => {
        this._id = "";
        this._name = "";
      });
  }

  _input: ?React.ElementRef<"textarea"> = null;
  _assignInputRef = (ref: ?React.ElementRef<"textarea">): void => {
    this._input = ref;
  };

  render(): React.Node {
    return (
      <Prompt
        className={`dim-bg flex-center bulb-prompt ${this.props.hidden ? "hidden" : ""}`}
        onClose={this.props.onClose}>
        <div className="prompt-box shadow">
          <div className="dialog">
            <div className="title">Write Something New</div>
            <div
              className="message">
              <div className="Editor bulb-editor">
                <div
                  className="text-body-wrapper">
                  <div className="text-body-wrapper-2">
                    <NoScrollArea backgroundColor="#fafafa"
                                  padding="10px"
                    >
                        <textarea className="text-body"
                                  onPaste={this.handlePaste}
                                  onKeyDown={this.handleKeyDown}
                                  onChange={
                                    e => this.setState({value: e.target.value})}
                                  placeholder="Write something or paste an image here ..."
                                  ref={this._assignInputRef}
                                  value={this.state.value}/>
                    </NoScrollArea>
                  </div>
                </div>
              </div>
              <div
                className={`image-wrapper shadow-light ${this.state.src != null ? "" : "hidden"}`}>
                <Button className="clear-image dark"
                        onClick={this.removeAttachedImage}>clear</Button>
                <Image contain src={this.state.src}/>
              </div>
            </div>
            <div className="btns">
              <Button
                onClick={this.props.onClose}
                text="cancel">clear</Button>
              <span className="btn-breaker"/>
              <ImagePicker
                cooldown={1}
                version={this.state.clipboardImageVersion}
                file={this.state.clipboardImage}
                onFinish={this.handleFinish}/>
              <Toggle firstIcon="location_on"
                      secondIcon="location_off"
                      isChanging={this.state.location}
                      onClick={this.toggleCurrentLocation}
                      tooltip="Attach current location to the bulb"
              />
              <Button
                className={`no ${this.state.sending ? "disabled" : ""}`}
                onClick={this.handleEditClick}
                tooltip="Write in a more advanced editor"
              >edit</Button>
              <span className="btn-breaker"/>
              <Button
                className={`yes ${this.state.value === "" ? "disabled" : ""}`}
                onClick={this.send.bind(this)}
                loading={this.state.sending}
                text="send">send</Button>
            </div>
          </div>
        </div>

      </Prompt>
    );
  }
}

