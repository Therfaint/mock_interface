/**
 * Created by therfaint- on 01/11/2017.
 */
import React from 'react';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';

class JsonDemo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false
        };
    }

    changeVisible = () => {
        this.setState({
            visible: !this.state.visible
        })
    };

    render() {
        return (
            <div style={{position: 'relative', width: 500}}>
                <div style={{marginBottom: 5, userSelect: 'none'}}>
                    <strong>返回实例：</strong>
                    <a onClick={this.changeVisible}
                       style={{fontSize: 14, marginLeft: 3}}>{this.state.visible ? '折叠实例' : '展开实例'}</a>
                </div>
                {
                    this.state.visible ? <Input value={this.props.jsonStr} style={{cursor: 'default', resize: 'none'}}
                                                autosize={{minRows: 3}} type="textarea"/> : null
                }
            </div>
        )
    }
}

export default JsonDemo;