import React from 'react';
import ReactDOM from 'react-dom';
import Editor from './Editor';
import Calendar from "./Calendar";
import EntryList from "./EntryList";

import TestData from "./TestData";

import "./base.css";


ReactDOM.render(
    // <Editor tagPrediction="journal idea friendship this that id"
    //         year={2017}
    //         debug={true}
    // />,
    <EntryList data={TestData.data}
               imageMap={{}}
               year={2016}/>,
    document.getElementById('root')
)
;
