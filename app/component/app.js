/**
 * Created by therfaint- on 03/11/2017.
 */
import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import {Switch, Route} from 'react-router';
import ProManage from './Home/proManage';
import WikiDoc from './Document/wikiDoc';

@withRouter
class App extends Component {

    constructor(props) {
        super(props);
        this.store = this.props.store;
    }

    // TODO:权限判断

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
