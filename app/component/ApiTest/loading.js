/**
 * Created by therfaint- on 30/11/2017.
 */
import React from 'react';

class Loading extends React.Component {

    render() {
        return (
            <div style={this.props.style}>
                <div className="loading">
                    <div style={{marginLeft: 3, color:'palevioletred'}}>玩命测试中..</div>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        )
    }
}

export default Loading;