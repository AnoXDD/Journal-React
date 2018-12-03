/**
 * Created by Anoxic on 8/19/2017.
 */

import React, {Component} from "react";
import image0 from "./img/trak-background-0.jpg";
import image1 from "./img/trak-background-1.jpg";
import image2 from "./img/trak-background-2.jpg";
import image3 from "./img/trak-background-3.jpg";
import image4 from "./img/trak-background-4.jpg";

export default class Background extends Component {

  state = {
    backgroundImage: image4,
    loadedIndex: Number.MAX_SAFE_INTEGER,
  };

  /**
   * A list of images, from the highest resolution to lowest
   */
  images = [image0, image1, image2, image3];


  componentDidMount() {
    for (let i = 0; i < this.images.length; ++i) {
      let image = new window.Image(),
        imageName = this.images[i];

      image.onload = () => {
        if (this.state.loadedIndex > i || i === 0) {
          this.setState({
            backgroundImage: imageName,
            loadedIndex: i,
          });
        }
      };
      image.src = imageName;
    }
  }

  render() {
    return (
      <div className="background"
           style={{backgroundImage: `url(${this.state.backgroundImage})`}}></div>
    );
  }
}