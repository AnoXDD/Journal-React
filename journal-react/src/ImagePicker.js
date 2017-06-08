/**
 * Created by Anoxic on 6/5/2017.
 *
 * An image picker for user to select
 */

import React, {Component} from "react";

import Button from "./Button";
import ProgressBar from "./ProgressBar";
import OneDriveManager from "./OneDriveManager";

export default class ImagePicker extends Component {

  COOLDOWN = 5000;

  version = 0;

  constructor(props) {
    super(props);

    // Dynamically generate ID
    this.id = `image-picker-${new Date().getTime()}`;

    this.state = {
      loading : false,
      progress: 0,
    };

    this.handleFileSelect = this.handleFileSelect.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
  }

  componentWillUpdate(nextProps) {
    if (nextProps.version > this.version) {
      this.version = nextProps.version;
      this.handleNewImage([nextProps.file]);
    }
  }

  uploadImage(f) {
    if (f.length === 1) {
      f = f[0];
    }

    return OneDriveManager.uploadToQueue(f, val => {
      this.setState({
        progress: val,
      });
    });
  }

  handleNewImage(files) {
    if (this.state.loading) {
      return false;
    }

    // Pre-screen files
    if (Array.isArray(files)) {
      files = files.filter(file => file && file.type.match('image.*'));
      if (!files.length) {
        return false;
      }
    }

    this.setState({
      progress: 0,
      loading : true,
    });

    return new Promise((res, rej) => {
      let fileObjects = [],
          unprocessed = files.length,
          onFinish = e => {
            fileObjects.push({
              name       : e.target.fileName,
              content    : e.target.result,
              contentType: e.target.contentType,
            });

            let onChangeFinish = r => {
              this.setState({
                loading: false,
              });

              if (typeof this.props.onFinish === "function") {
                return this.props.onFinish(r);
              }
            };

            if (--unprocessed === 0) {
              (typeof this.props.onChange === "function" ?
                  this.props.onChange(fileObjects)
                  : this.uploadImage(fileObjects))
                  .then(response => {
                    return new Promise(resolve => {
                      setTimeout(() => {
                        onChangeFinish(response)
                            .then(() => {
                              resolve();
                            })
                            .catch(err => {
                              console.error(err.stack);
                            })
                      }, this.props.cooldown || this.COOLDOWN);
                    });
                  })
                  .then(() => {
                    this.input.value = null;

                    this.setState({
                      progress: 0,
                      loading : false,
                    });
                    res();
                  })
                  .catch(err => {
                    this.setState({
                      progress: 0,
                      loading : false,
                    });
                    rej();
                  });
            }
          };

      // Loop through the FileList and render image files as thumbnails.
      for (let i = 0; i < files.length; i++) {
        let f = files[i];

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = onFinish;

        // Read in the image file as a data URL.
        reader.fileName = f.name;
        reader.contentType = f.type;
        reader.readAsArrayBuffer(f);
      }
    });
  }

  handleFileSelect(e) {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    this.handleNewImage(e.target.files);
  }

  render() {
    return (
        <label
            className={`label-btn ${this.state.loading ? "disabled" : ""} ${this.props.className || ""}`}
            htmlFor={this.id}>
          <Button loading={this.state.loading}
                  tooltip="Upload images"
                  text={this.props.text}
          >
            {this.props.children || "file_upload"}
          </Button>
          {this.props.multiple ? (
              <input type="file" id={this.id}
                     className="hidden"
                     ref={ref => this.input = ref}
                     onChange={this.handleFileSelect} accept="image/*"
                     multiple/>
          ) : (
              <input type="file" id={this.id}
                     className="hidden"
                     ref={ref => this.input = ref}
                     onChange={this.handleFileSelect} accept="image/*"/>
          )}
          <ProgressBar className={this.state.progress ? "" : "transparent"}
                       progress={this.state.progress}/>
        </label>
    );
  }

}
