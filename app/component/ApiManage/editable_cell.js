/**
 * Created by therfaint- on 14/08/2017.
 */
import React from 'react';
import Message from 'antd/lib/message';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import Select from 'antd/lib/select';
import Table from 'antd/lib/table';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';

class EditableCell extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            value: this.props.value
        };
    }

    handleChange = (e) => {
        const value = e.target.value;
        this.props.onChange(value);
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: String(nextProps.value) ? nextProps.value : ''
        })
    }

    render() {

        const { value } = this.state;

        return (

            <span className="editable-cell"  style={{width:180, display: 'inline-block', verticalAlign: 'middle'}}>
                <span className="editable-cell-input-wrapper">
                    <Input
                        style={{...this.props.style, display: (value === 'THIS_iS_ARRAY_TYPE' ? 'none' : 'inline-block')}}
                        value={value}
                        disabled={this.props.hasOwnProperty('disabled')}
                        onChange={this.handleChange}
                    />
                </span>
            </span>

        )

    }

}

export default EditableCell;