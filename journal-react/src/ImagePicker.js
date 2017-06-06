/**
 * Created by Anoxic on 6/5/2017.
 *
 * An image picker for user to select
 */

import React, {Component} from "react";

import Button from "./Button";
import OneDriveManager from "./OneDriveManager";

export default class ImagePicker extends Component {

  COOLDOWN = 5000;

  constructor(props) {
    super(props);

    // Dynamically generate ID
    this.id = `image-picker-${new Date().getTime()}`;

    this.state = {
      loading: false,
    };

    this.handleFileSelect = this.handleFileSelect.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
  }

  uploadImage(f) {
    return OneDriveManager.uploadToQueue(f);
  }

  handleFileSelect(e) {
    this.setState({
      loading: true,
    });

    return new Promise(res => {
      let files = e.target.files,
          fileObjects = [],
          unprocessed = files.length,
          onFinish = e => {
            fileObjects.push({
              name       : e.target.fileName,
              content    : e.target.result,
              contentType: e.target.contentType,
            });

            let onChangeFinish = () => {
              this.setState({
                loading: false,
              });

              if (typeof this.props.onFinish === "function") {
                return this.props.onFinish();
              }
            };

            if (--unprocessed === 0) {
              (typeof this.props.onChange === "function" ?
                  this.props.onChange(fileObjects)
                  : this.uploadImage(fileObjects))
                  .then(() => {
                    return new Promise(res => {
                      setTimeout(() => {
                        onChangeFinish()
                            .then(() => {
                              res();
                            })
                      }, this.COOLDOWN);
                    });
                  })
                  .then(() => {
                    this.setState({
                      loading: false,
                    });
                    res();
                  });
            }
          };

      // Loop through the FileList and render image files as thumbnails.
      for (let i = 0; i < files.length; i++) {
        let f = files[i];
        // Only process image files.
        if (!f.type.match('image.*')) {
          continue;
        }

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

  render() {
    return (
        <label className={`btn label-btn ${this.state.loading ? "disabled" : ""} ${this.props.className || ""}`}
               htmlFor={this.id}>
          <Button loading={this.state.loading}>
            {this.props.children || "file_upload"}
          </Button>
          {this.props.multiple ? (
              <input type="file" id={this.id}
                     className="hidden"
                     onChange={this.handleFileSelect} accept="image/*"
                     multiple/>
          ) : (
              <input type="file" id={this.id}
                     className="hidden"
                     onChange={this.handleFileSelect} accept="image/*"/>
          )}
        </label>
    );
  }

}
