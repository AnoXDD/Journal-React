/**
 * Created by Anoxic on 6/5/2017.
 *
 * An image picker for user to select
 */

import React, {Component} from "react";

import Button from "./Button";

export default class ImagePicker extends Component {
  constructor(props) {
    super(props);

    // Dynamically generate ID
    this.id = `image-picker-${new Date().getTime()}`;

    this.handleFileSelect = this.handleFileSelect.bind(this);
  }

  handleFileSelect(e) {
    let files = e.target.files,
        fileObjects = [],
        unprocessed = files.length,
        onFinish = e => {
          fileObjects.push(e.target.result);

          if (--unprocessed === 0) {
            this.props.onChange(fileObjects);
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
      reader.readAsBinaryString(f);
    }
  }

  render() {
    return (
        <label className="btn label-btn" htmlFor={this.id}>
          <Button loading={this.props.loading}>attach_file</Button>
          <input type="file" id={this.id}
                 className="hidden"
                 onChange={this.handleFileSelect} accept="image/*"
                 multiple/>
        </label>
    );
  }

}
