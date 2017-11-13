/**
 * Created by therfaint- on 08/11/2017.
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
import Notification from 'antd/lib/notification';
import TreeSelect from 'antd/lib/tree-select';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

import JsonFormatter from '../util/JSON_Format'

import ParamTable from './editable_param_table';

import dataParser from '../util/Data_Parser';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

const Option = Select.Option;

Message.config({
    duration: 2,
});

Notification.config({
    duration: 9,
});

class ModuleManage extends React.Component {

    constructor(props) {
        super(props);
        this.tableColumns = [{
            title: '模块名称',
            key: 'moduleName',
            dataIndex: 'moduleName',
            width: 150
        }, {
            title: '模块描述',
            key: 'description',
            dataIndex: 'description',
            width: 250
        }, {
            title: '操作',
            key: 'operations',
            width: 200,
            render: (text, record, index) => {
                if(record.moduleName === '系统目录') {
                    return (
                        <span>系统目录不可操作</span>
                    )
                }else{
                    return(
                        <Button icon="delete" className="op-btn" onClick={() => this.deleteModule(record)}>删除</Button>
                    )
                }
            }
        }];
        this.state = {

            modules: [],
            moduleName: '',
            description: '',

            addVisible: false,

            pageId: undefined,

            rootId: undefined

        };
    }

    // 新增API
    saveModule = () => {
        let data = {
            moduleName: this.state.moduleName,
            description: this.state.description,
            proId: this.props.pro._id
        };
        $.ajax({
            url: '/saveModule.json',
            data: data,
            method: 'POST',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    Message.success('模块创建成功');
                    this.getAllModuleByProId();
                } else {
                    Message.error(data.msg.message)
                }
            }
        })
    };

    // 删除API
    deleteModule = (record) => {
        Modal.confirm({
            content: <div>删除后子接口将默认移动至系统模块<br/><br/>确认删除？</div>,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                $.ajax({
                    url: '/deleteModule.json',
                    data: {
                        id: record._id,
                        rootId: this.state.rootId
                    },
                    method: 'POST',
                    dataType: 'JSON',
                    success: data => {
                        if (data.success) {
                            Message.success('删除成功');
                            this.getAllModuleByProId();
                        } else {
                            Message.error(data.msg)
                        }
                    }
                })
            }
        });
    };

    // 获取全部模块
    getAllModuleByProId = () => {
        $.ajax({
            url: '/getAllModuleById.json?proId=' + this.state.pageId,
            method: 'GET',
            dataType: 'JSON',
            success: data => {
                let rootId = '';
                data.result.map(item => {
                    item.key = item._id;
                    if(item.moduleName === '系统目录'){
                        rootId = item._id;
                    }
                });
                if (data.success) {
                    this.setState({
                        modules: data.result,
                        rootId
                    })
                } else {
                    Message.error(data.msg)
                }
            }
        })
    };

    // 显示新增API Modal
    showAddModal = () => {
        this.emptyModal();
        this.setState({
            addVisible: true
        })
    };

    // 隐藏新增API Modal
    closeAddModal = (bool) => {
        if (!this.state.moduleName && bool) {
            Message.error('请填写模块名称');
            return;
        }
        // if (!this.state.description && bool) {
        //     Message.error('请填写模块描述');
        //     return;
        // }
        if (bool) {
            this.saveModule();
        }
        this.setState({
            addVisible: false
        })
    };

    // 清空新增/编辑Modal
    emptyModal = () => {
        this.setState({
            moduleName: '',
            description: ''
        })
    };

    handleInputChange = (e, type) => {
        let state = {};
        state[type] = e.target.value;
        this.setState(state);
    };

    componentWillMount = () => {
        this.setState({pageId: this.props.pro._id});
    };

    componentDidMount = () => {
        this.getAllModuleByProId();
    };

    render() {

        return (
            <section id="container">
                <div className="title">
                    <span style={{fontSize: 20, fontWeight: 'bold'}}>模块配置</span>
                    <Icon style={{fontSize: 18, marginLeft: 9, cursor: 'pointer'}} type="plus-circle-o"
                          onClick={() => this.showAddModal()}/>
                </div>
                <Table
                    columns={this.tableColumns}
                    dataSource={this.state.modules}
                    pagination={false}
                    scroll={{y: 600}}
                />
                <Modal
                    title="新建模块"
                    visible={this.state.addVisible}
                    onOk={() => this.closeAddModal(true)}
                    maskClosable={false}
                    onCancel={() => this.closeAddModal(false)}>
                    <div>
                        <div className="clearfix" style={{width: 400, margin: '0 auto 9px'}}>
                            <span style={{lineHeight: '28px', verticalAlign: 'middle'}}>模块名称：</span>
                            <span><Input style={{width: 300, float: 'right'}} value={this.state.moduleName}
                                         placeholder="请输入模块名称"
                                         onChange={(e) => this.handleInputChange(e, 'moduleName')}/></span>
                        </div>
                        <div className="clearfix" style={{width: 400, margin: '0 auto 9px'}}>
                            <span style={{lineHeight: '28px', verticalAlign: 'middle'}}>模块描述：</span>
                            <span><Input value={this.state.description} placeholder="请输入模块描述"
                                         style={{ width: 300, float: 'right'}}
                                         autosize={{minRows:3}} type="textarea" onChange={(e) => this.handleInputChange(e, 'description')}/></span>
                        </div>
                    </div>
                </Modal>
            </section>
        )
    }

}

export default ModuleManage;