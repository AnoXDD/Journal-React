import React, {Component} from 'react';

import NoScrollArea from "./NoScrollArea";
import Button from "./Button";
import Prompt from "./Prompt";

/**
 * This editor is only appropriate to edit a bulb, NOT for an article, since
 * it's basically a prompt
 */

export default class BulbEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",

      sending: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !this.props.hidden || !nextProps.hidden;
  }


  send() {
    this.setState({
      sending: true,
    });

    this.props.onSend(this.state.value)
        .then(() => {
          this.setState({
            value  : "",
            sending: false
          });
        }, () => {
          this.setState({sending: false});
        });
  }

  render() {
    return (
        <Prompt
            className={`dim-bg flex-center ${this.props.hidden ? "hidden" : ""}`}
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
                                  onChange={e => this.setState({value: e.target.value})}
                                  value={this.state.value}/>
                      </NoScrollArea>
                    </div>
                  </div>
                </div>
              </div>
              <div className="btns">
                <Button
                    onClick={this.props.onClose}
                    text="cancel">clear</Button>
                <Button
                    className={`no ${this.state.sending ? "disabled" : ""}`}
                    onClick={() => {this.props.onEdit(this.state.value)}}
                    text="write in editor"
                >edit</Button>
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

