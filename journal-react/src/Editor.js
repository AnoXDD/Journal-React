import React, {Component} from 'react';
import './Editor.css';

class Editor extends Component {

    constructor(props) {
        // todo use props to pre-fill the area
        super(props);

        this.state = {
            title      : "This is title 题目",
            body       : "This is body 正问扽岁卧槽什么情况",
            stats      : {
                timeCreated: 0,
                timeBegin  : 0,
                timeEnd    : 0,
            },
            timeElapsed: 0,
            tags       : [],
            photos     : [],
            musics     : [],
            movies     : [],
            links      : []
        };

        var t = this;
        setInterval(() => {
            t.setState({
                timeElapsed: this.state.timeElapsed + 1
            });
        }, 1000);

        this.onTitleChange = this.onTitleChange.bind(this);
        this.onBodyChange = this.onBodyChange.bind(this);
    }

    onTitleChange(event) {
        this.setState({
            title: event.target.value
        });
    }

    onBodyChange(event) {
        this.setState({
            body: event.target.value
        });
    }

    countChars(str) {
        return (str.match(/[\u00ff-\uffff]|\S+/g) || []).length;
    }

    convertToDateTime(seconds) {
        return "131333 2323";
    }

    convertToElapsed(seconds) {
        return `${parseInt(seconds / 60)}:${("0" + seconds % 60).slice(-2)}`;
    }

    render() {
        return (
            <div className="Editor">
                <div className="header">
                    <input className="title"
                           value={this.state.title}
                           onChange={this.onTitleChange}
                    >
                    </input>
                    <div className="stats">
                        <div className="stat chars">
                            { this.countChars(this.state.body) }
                        </div>
                        <div className="stat times">
                            <div className="time created">
                                {this.convertToDateTime(this.state.stats.timeCreated)}
                            </div>
                            <div className="time begin">
                                {this.convertToDateTime(this.state.stats.timeBegin)}
                            </div>
                            <div className="time end">
                                {this.convertToDateTime(this.state.stats.timeEnd)}
                            </div>
                        </div>
                        <div className="stat elapsed">
                            {this.convertToElapsed(this.state.timeElapsed)}
                        </div>
                    </div>
                </div>
                <div className="no-scroll text-body-wrapper">
                    <textarea className="no-scroll-wrapper text-body"
                              value={this.state.body}
                              onChange={this.onBodyChange}
                    >
                    </textarea>
                </div>
                <div className="extras">
                    <div className="extra new"></div>
                    <div className="extra tags"></div>
                    <div className="extra photos"></div>
                    <div className="extra musics"></div>
                    <div className="extra movies"></div>
                    <div className="extra links"></div>
                </div>
                <div className="buttons">
                    <a className="vertical-align btn send">
                        <i className="vertical-align-wrapper material-icons">send</i>
                    </a>
                </div>
            </div>
        );
    }
}

export default Editor;
