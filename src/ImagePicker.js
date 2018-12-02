// @flow strict-local

/**
 * Created by Anoxic on 6/5/2017.
 *
 * An image picker for user to select
 */

import Button from "./lib/Button";
import ProgressBar from "./ProgressBar";
import OneDriveManager from "./OneDriveManager";

import * as React from "react";

type Props = {|
  +className?: string,
  +cooldown?: number,
  +version?: number,
  +file?: ?File,
  +multiple?: boolean,
  +onFinish: (image: OneDriveItem) => Promise<void>,
|};

type State = {|
  loading: boolean,
  progress: number,
|};

export default class ImagePicker extends React.Component<Props, State> {

  COOLDOWN = 5000;

  version = 0;
  id: string = `image-picker-${
    new Date().getTime()
    }`;

  state: State = {
    loading : false,
    progress: 0,
  };

  componentWillUpdate(nextProps: Props): void {
    const {version} = nextProps;
    if (version != null && version > this.version) {
      this.version = version;
      if (nextProps.file != null) {
        this.handleNewImage([nextProps.file]);
      }
    }
  }

  uploadImage(file: Array<OneDriveQueuedItem>) {
    let f = file;
    if (f.length === 1) {
      f = f[0];
    }

    return OneDriveManager.uploadToQueue(f, val => {
      this.setState({
        progress: val,
      });
    });
  }

  handleNewImage(rawFiles: Array<File>): void {
    if (this.state.loading) {
      return;
    }

    // Pre-screen files
    const files = rawFiles.filter(file => file && file.type.match('image.*'));
    if (!files.length) {
      return;
    }

    this.setState({
      progress: 0,
      loading : true,
    });

    new Promise((res, rej) => {
      let fileObjects = [],
        unprocessed = files.length,
        onFinish = e => {
          const target: FileReader = e.target;

          fileObjects.push({
            name       : e.target.fileName,
            content    : e.target.result,
            contentType: e.target.contentType,
          });

          let onChangeFinish = r => {
            this.setState({
              loading: false,
            });

            return this.props.onFinish(r);
          };

          if (--unprocessed === 0) {
            this.uploadImage(fileObjects)
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
                    },
                    this.props.cooldown != null ? this.props.cooldown : this.COOLDOWN);
                });
              })
              .then(() => {
                if (this.input != null) {
                  this.input.value = "";
                }

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
        // $FlowFixMe because it worked before flow type is enabled
        reader.fileName = f.name;
        // $FlowFixMe because it worked before flow type is enabled
        reader.contentType = f.type;
        reader.readAsArrayBuffer(f);
      }
    });
  }

  handleFileSelect = (e: SyntheticInputEvent<HTMLInputElement>): void => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    this.handleNewImage(Array.from(e.target.files));
  };

  input: ?React.ElementRef<"input"> = null;
  assignInputRef = (ref: ?React.ElementRef<"input">): void => {
    this.input = ref;
  };

  render() {
    return (
      <label
        className={`label-btn ${this.state.loading ? "disabled" : ""} ${this.props.className || ""}`}
        htmlFor={this.id}>
        <Button loading={this.state.loading}
                tooltip="Upload images"
        >file_upload</Button>
        {this.props.multiple === true ? (
          <input type="file" id={this.id}
                 className="hidden"
                 ref={this.assignInputRef}
                 onChange={this.handleFileSelect} accept="image/*"
                 multiple/>
        ) : (
          <input type="file" id={this.id}
                 className="hidden"
                 ref={this.assignInputRef}
                 onChange={this.handleFileSelect} accept="image/*"/>
        )}
        <ProgressBar className={this.state.progress ? "" : "transparent"}
                     progress={this.state.progress}/>
      </label>
    );
  }

}
