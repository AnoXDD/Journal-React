import React from 'react';
import ReactDOM from 'react-dom';
import Editor from './Editor';
import Calendar from "./Calendar";
import EntryView from "./EntryView";

import TestData from "./TestData";

import './index.css';

ReactDOM.render(
    // <Editor tagPrediction="journal idea friendship this that id"
    //         year={2017}
    // bodyWidth={60}
    // debug={true}
    // />,
    <EntryView data={TestData.data}
               debug={true}
               imageMap={{}}
               version={new Date().getTime()}/>,
    document.getElementById('root')
)
;
