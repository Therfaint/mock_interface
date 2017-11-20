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
            // editable: !this.props.value,
            value: this.props.value
        };
        this.timeOut = null;
    }

    handleChange = (e) => {
        const value = e.target.value;
        this.setState({ value });
    };

    check = () => {
        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    };

    edit = () => {
        this.setState({ editable: true });
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
                        style={{width:150, display: (value === 'THIS_iS_ARRAY_TYPE' ? 'none' : 'inline-block')}}
                        value={value}
                        onChange={this.handleChange}
                        onBlur={()=>this.check()}
                        onPressEnter={()=>this.check()}
                    />
                </span>
            </span>

        )

    }

}

export default EditableCell;