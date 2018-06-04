/**
 * Created by therfaint- on 01/08/2017.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from "react-router-dom";
import App from './component/app';

ReactDOM.render(<Router>
    <App/>
</Router>, document.getElementById('todoapp'));
