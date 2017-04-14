import React, {Component} from 'react';

import './Editor.css';

var Ink = require("react-ink");

class Editor extends Component {

    constructor(props) {
        // todo use props to pre-fill the area
        super(props);

        this.state = {
            title      : "This is title 题目",
            body       : "This is body 正文 This is body 正文 This is body 正文 This is body 正文 This is body 正文 This is body 正文 This is body 正文",
            stats      : {
                timeCreated: 0,
                timeBegin  : 0,
                timeEnd    : 0,
            },
            timeElapsed: 0,
            tags       : ["onme", "two", "threeeeee"],
            photos     : [],
            musics     : [],
            movies     : [],
            links      : []
        };

        setInterval(() => {
            // On purpose: to avoid laggy update
            // eslint-disable-next-line
            ++this.state.timeElapsed;
        }, 1000);

        this.onTitleChange = this.onTitleChange.bind(this);
        this.onBodyChange = this.onBodyChange.bind(this);
        this.onNewTagKeyPress = this.onNewTagKeyPress.bind(this);
    }

    generateCurrentTags() {
        const tagItems = this.state.tags.map((tag, index) => {
            return (
                <span
                    key={`tag-${tag}`}
                    className="vertical-align-wrapper tag"
                    onClick={(event) => {this.removeTagAtIndex(index);}}
                >{tag}</span>
            );
        });
        return (
            <div className="vertical-align tags">
                { tagItems }
                <span className="vertical-align-wrapper tag">
                <input
                    type="text"
                    className="new-tag"
                    onKeyPress={this.onNewTagKeyPress}
                />
                </span>
            </div>
        );
    }

    removeTagAtIndex(index) {
        var tags = this.state.tags;
        tags.splice(index, 1);

        this.setState({
            tags: tags
        });
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

    onNewTagKeyPress(event) {
        if (event.key === "Enter") {
            var newTags = [...this.state.tags],
                newTag = event.target.value;

            // Only add it when not found
            if (newTags.length && newTags.indexOf(newTag) === -1) {
                newTags.push(newTag);
                this.setState({
                    tags: newTags
                });
            }

            event.target.value = "";
        }
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
                    <span className="wrapper top"></span>
                    <textarea className="no-scroll-wrapper text-body"
                              value={this.state.body}
                              onChange={this.onBodyChange}
                    >
                    </textarea>
                    <span className="wrapper bottom"></span>
                </div>
                <div className="buttons">
                    <a className="vertical-align btn tags">
                        <Ink/>
                        <i className="material-icons vertical-align-wrapper">label_outline</i>
                    </a>
                    { this.generateCurrentTags() }
                    <a className="vertical-align btn photos">
                        <Ink/>
                        <i className="material-icons vertical-align-wrapper">photo_library</i>
                    </a>
                    <a className="vertical-align btn musics">
                        <Ink/>
                        <i className="material-icons vertical-align-wrapper">library_music</i>
                    </a>
                    <a className="vertical-align btn movies">
                        <Ink/>
                        <i className="material-icons vertical-align-wrapper">movie</i>
                    </a>
                    <a className="vertical-align btn links">
                        <Ink/>
                        <i className="material-icons vertical-align-wrapper">link</i>
                    </a>
                    <a className="vertical-align btn new">
                        <Ink/>
                        <i className="material-icons vertical-align-wrapper">more_horiz</i>
                    </a>
                    <a className="vertical-align btn send accent">
                        <Ink/>
                        <i className="vertical-align-wrapper material-icons">send</i>
                    </a>
                </div>
            </div>
        );
    }
}

export default Editor;
