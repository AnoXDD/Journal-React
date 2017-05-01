/**
 * Created by Anoxic on 043017.
 * A prediction input that will generate a series of divs that can be edited
 * later. Looks like the recipient area of gmail
 */

import React, {Component} from "react";
import NoScrollArea from "./NoScrollArea";
import PredictionInput from "./PredictionInput";

export default class PredictionInputs extends Component {

  constructor(props) {
    super(props);

    this.state = {
      tags: this.props.tags
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleKeyDown(event, prediction) {
    const onEnter = (event) => {
      let newTags = [...this.state.tags],
          newTag = event.target.value.trim();

      // Only add it when not found
      if (newTag.length && newTags.indexOf(newTag) === -1) {
        newTags.push(newTag);
        this.setState({
          tags         : newTags,
          tagPrediction: "",
        });
      }

      event.target.value = "";

      // Submit the change result
      this.props.onChange(this.state.tags);
    }

    if (event.key === "Tab") {

      event.preventDefault();
      if (event.target.value === prediction) {
        onEnter(event);
      } else {
        event.target.value = prediction;
      }

    } else if (event.key === "Enter") {
      onEnter(event);

    } else if (event.key === "Backspace") {

      if (!event.target.value && this.state.tags.length) {
        let newTags = [...this.state.tags];
        event.target.value = (newTags.pop() || "") + " ";

        this.setState({
          tags: newTags
        });
      }
    }
  }

  render() {
    const tagItems = this.state.tags.map((tag, index) => {
      return (
          <span
              key={`tag-${tag}`}
              className="tag"
              onClick={(event) => {this.removeTagAtIndex(index);}}
          >{tag}</span>
      );
    });

    return (
        <NoScrollArea className="current-tags" padding="10px">
          <div className="tags-wrapper">
            <div className="tags">
              { tagItems }
              <PredictionInput
                  className={this.props.className}
                  inputClassName="normal underlined"
                  onKeyDown={this.handleKeyDown}
                  candidates={this.props.tagPrediction}
                  blacklist={this.state.tags}
              />
            </div>
          </div>
        </NoScrollArea>
    );
  }
}
