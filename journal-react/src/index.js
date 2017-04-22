import React from 'react';
import ReactDOM from 'react-dom';
import Editor from './Editor';
import Calendar from "./Calendar";

import TestData from "./TestData";

import './index.css';

ReactDOM.render(
    // <Editor tagPrediction="journal idea friendship this that id"
    //         year={2017}
    //         debug={true}
    // />,
    <Calendar data={TestData.data} year={2016}/>,
    document.getElementById('root')
)
;
