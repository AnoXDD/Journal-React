import React, {Component} from 'react';

import NoScrollArea from "./NoScrollArea";
import Button from "./Button";
import Toggle from "./Toggle";
import Prompt from "./Prompt";
import Image from "./Image";
import ImagePicker from "./ImagePicker";
import OneDriveManager from "./OneDriveManager";

import R from "./R";

/**
 * This editor is only appropriate to edit a bulb, NOT for an article, since
 * it's basically a prompt
 */

export default class BulbEditor extends Component {

  /* The last imageId associated with this bulb */
  id = "";
  name = "";

  constructor(props) {
    super(props);

    this.state = {
      value   : "",
      location: "",

      sending        : false,
      loadingLocation: false,
      src            : null,

      clipboardImage       : null,
      clipboardImageVersion: 0,
    };

    this.handleFinish = this.handleFinish.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
    this.toggleCurrentLocation = this.toggleCurrentLocation.bind(this);
    this.getCurrentLocation = this.getCurrentLocation.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !this.props.hidden || !nextProps.hidden;
  }

  toggleCurrentLocation() {
    if (!this.state.location) {
      this.getCurrentLocation();
    } else {
      this.setState({
        location: "",
      });
    }
  }

  getCurrentLocation() {
    this.setState({
      loadingLocation: true,
    });

    navigator.geolocation.getCurrentPosition(pos => {
      var crd = pos.coords;

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
    });
  }

  handleEditClick() {
    let {value} = this.state;

    this.setState({
      value: "",
    });

    this.props.onEdit(value);
  }

  handleFinish(image) {
    let {id, name} = image,
        src = image["@microsoft.graph.downloadUrl"],
        onFinish = ()=> {
          this.id = id;
          this.name = name;
          this.setState({
            src: src,
          });
        }

    if (this.id) {
      // There is a previous image uploaded, and we want to remove it
      return OneDriveManager.removeItemById(this.id)
          .catch(err => {
            console.error(err.stack);
          })
          .then(() => {
            onFinish();
          });
    }

    return new Promise(res => {
      onFinish();
      res();
    });
  }

  handlePaste(e) {
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
  }

  // todo how to remove it?

  send() {
    this.setState({
      sending: true,
    });

    this.props.onSend(this.state.value + this.state.location,
        this.id && this.name ? {id: this.id, name: this.name} : undefined)
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
          this.id = "";
          this.name = "";
        });
  }

  render() {
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
                                  onChange={e => this.setState({value: e.target.value})}
                                  placeholder="Write something here ..."
                                  value={this.state.value}/>
                      </NoScrollArea>
                    </div>
                  </div>
                </div>
                <div
                    className={`image-wrapper shadow-light ${this.state.src ? "" :"hidden"}`}>
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
                    className={`yes ${this.state.value.length === 0 ? "disabled" : ""}`}
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

