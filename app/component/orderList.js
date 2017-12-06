/**
 * Created by therfaint- on 29/11/2017.
 */
import React from 'react';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';

class OrderList extends React.Component{

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

    render(){
        return (
            <div>

            </div>
        )
    }
}

export default OrderList;