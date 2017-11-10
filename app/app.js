/**
 * Created by therfaint- on 03/11/2017.
 */
import React, {Component, PropTypes} from 'react';
import {withRouter} from "react-router-dom";
import {Switch, Route} from 'react-router';
import ProManage from './component/proManage';
import WikiDoc from './component/wikiDoc';

@withRouter
class App extends Component {

    constructor(props) {
        super(props);
        this.store = this.props.store;
    }

    render() {
        return (
            <div>
                <Switch>
                    <Route
                        path="/project"
                        component={ProManage}/>
                    <Route
                        path="/wiki/*"
                        component={WikiDoc}/>
                </Switch>
            </div>
        )
    }

}

export default App;
