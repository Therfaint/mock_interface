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
            editable: !this.props.value,
            value: this.props.value
        }
    }

    handleChange = (e) => {
        const value = e.target.value;
        this.setState({ value });
    };

    check = (bool) => {
        this.setState({ editable: bool });
        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    };

    edit = () => {
        this.setState({ editable: true });
    };

    render() {

        const { value, editable } = this.state;

        const editStatus = value === 'array' ? false : editable;

        const addIcon = (
            <Tooltip title="保存" stlye={{pointer: 'cursor'}}>
                <Icon type="check" onClick={()=>this.check(false)}/>
            </Tooltip>
        )

        return (

            <span className="editable-cell"  style={{width:180, display: 'inline-block', verticalAlign: 'middle'}}>
                {
                    editStatus ?
                        <span className="editable-cell-input-wrapper">
                            <Input
                                style={{border: 'none', width:180}}
                                value={value}
                                suffix={addIcon}
                                onChange={this.handleChange}
                                onPressEnter={()=>this.check(false)}
                            />
                        </span>
                        :
                        <div className="editable-cell-input-wrapper" style={{marginLeft: 8, paddingTop: 1, width: 180, height: 28, lineHeight: '28px', overflowY: 'scroll'}} onClick={this.check.bind(this, true)}>
                            {value === 'array' ? '' : value || ' '}
                        </div>
                }
            </span>

        )

    }

}

export default EditableCell;