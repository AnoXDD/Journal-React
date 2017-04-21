import React from 'react';
import ReactDOM from 'react-dom';
import Editor from './Editor';
import './index.css';

ReactDOM.render(
  <Editor tagPrediction="journal idea friendship this that id"
          year={2017}
          debug={true}
  />,
  document.getElementById('root')
);
