/**
 * Created by Anoxic on 043017.
 * A prediction input that will generate a series of divs that can be edited
 * later. Looks like the recipient area of gmail
 */

import React, {Component} from "react";
import NoScrollArea from "./lib/NoScrollArea";
import PredictionInput from "./lib/PredictionInput";

export default class PredictionInputs extends Component {

  constructor(props) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  removeTagAtIndex(index) {
    var tags = this.props.tags;
    tags.splice(index, 1);

    this.props.onChange(tags);
  }

  handleKeyDown(event: SyntheticKeyboardEvent<>, prediction: string): void {
    if (!this.props.disabled) {
      const onEnter = (event) => {
        let newTag = event.target.value.trim();

        // Only add it when not found
        if (newTag.length && this.props.tags.indexOf(newTag) === -1) {
          this.setState({
            tagPrediction: "",
          });

          // Submit the changed result
          this.props.onChange([...this.props.tags, newTag]);
        }

        event.target.value = "";
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

        if (!event.target.value && this.props.tags.length) {
          let newTags = [...this.props.tags];
          event.target.value = (newTags.pop() || "") + " ";

          this.props.onChange(newTags);
        }
      }
    }
  }

  render() {
    const tagItems = this.props.tags.map((tag, index) => {
      return (
        <span
          key={`tag-${tag}`}
          className="tag"
          onClick={(event) => {
            this.removeTagAtIndex(index);
          }}
        >{tag}</span>
      );
    });

    return (
      <NoScrollArea className="PredictionInputs" padding="10px">
        <div className="tags-wrapper">
          <div className="tags">
            { tagItems }
            <PredictionInput
              className={this.props.className}
              inputClassName="normal underlined"
              onKeyDown={this.handleKeyDown}
              candidates={this.props.tagPrediction}
              blacklist={this.props.tags}
            />
          </div>
        </div>
      </NoScrollArea>
    );
  }
}
