/**
 * Created by therfaint- on 01/11/2017.
 */
import React from 'react';
import Input from 'antd/lib/input';

class JsonDemo extends React.Component{


    render(){
        return (
            <div style={{position: 'relative', width:500}}>
                <div style={{marginBottom:5}}>
                    <strong>返回实例：</strong>
                </div>
                <Input value={this.props.jsonStr} style={{cursor: 'default'}} autosize={{minRows:6}} type="textarea"/>
            </div>
        )
    }
}

export default JsonDemo;