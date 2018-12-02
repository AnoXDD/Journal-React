// @flow strict-local

/**
 * Created by Anoxic on 043017.
 * A prediction input that will generate a series of divs that can be edited
 * later. Looks like the recipient area of gmail
 */

import NoScrollArea from "./lib/NoScrollArea";
import PredictionInput from "./lib/PredictionInput";

import * as React from "react";

type Props = {|
  +className: string,
  +disabled?: boolean,
  +onChange: (tags: Array<string>) => void,
  +tagPrediction: Array<string>,
  +tags: Array<string>,
|}

type State = {|
  tagPrediction: string,
|};

export default class PredictionInputs extends React.Component<Props, State> {
  removeTagAtIndex(index: number): void {
    const tags = this.props.tags;
    tags.splice(index, 1);

    this.props.onChange(tags);
  }

  handleKeyDown = (event: SyntheticKeyboardEvent<>,
                   prediction: string): void => {
    const {target} = event;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (this.props.disabled !== true) {
      const onEnter = (target: HTMLInputElement) => {
        let newTag = target.value.trim();

        // Only add it when not found
        if (newTag.length && this.props.tags.indexOf(newTag) === -1) {
          this.setState({
            tagPrediction: "",
          });

          // Submit the changed result
          this.props.onChange([...this.props.tags, newTag]);
        }

        target.value = "";
      };

      if (event.key === "Tab") {

        event.preventDefault();
        if (target.value === prediction) {
          onEnter(target);
        } else {
          target.value = prediction;
        }

      } else if (event.key === "Enter") {
        onEnter(target);

      } else if (event.key === "Backspace") {

        if (!target.value && this.props.tags.length) {
          let newTags = [...this.props.tags];
          target.value = (newTags.pop() || "") + " ";

          this.props.onChange(newTags);
        }
      }
    }
  };

  render(): React.Node {
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
