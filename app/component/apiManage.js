/**
 * Created by therfaint- on 01/08/2017.
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
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

import JsonFormatter from '../util/JSON_Format'

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

const Option = Select.Option;
let pageSize = 10;

Message.config({
    duration: 2,
});

Notification.config({
    duration: 9,
});

const JF = new JsonFormatter();

class ApiManage extends React.Component{

    constructor(props){
        super(props);
        this.tableColumns = [{
            title: '请求路径',
            key: 'url',
            width: 300,
            render: (text, record, index) =>(
                <span>{record.url}</span>
            )
        },{
            title: '请求类型',
            key: 'method',
            width: 150,
            render: (text, record, index) =>(
                <span>{record.method}</span>
            )
        },{
            title: '创建时间',
            key: 'createTime',
            width: 200,
            render: (text, record, index) =>(
                <span>{record.createTime}</span>
            )
        },{
            title: '返回数据',
            key: 'json',
            width: 400,
            render: (text, record, index) =>(
                <div className="ellipsis">
                    <a href="#" onClick={()=>this.showJsonModal(record)}>{record.json}</a>
                </div>
            )
        },{
            title: '操作',
            key: 'operations',
            width: 300,
            render: (text, record, index) => (
                <div>
                    <Button icon="setting" onClick={()=>this.showEditModal(record)}>编辑</Button>
                    <Button icon="delete" className="op-btn" onClick={()=> this.deleteAPI(record)}>删除</Button>
                    <Button icon="tool" className="op-btn" onClick={()=> this.sendAPI(record)}>测试</Button>
                </div>
            )
        }];
        this.state = {
            addStatus: false,
            editStatus: false,
            paramStatus: false,
            editParamStatus: false,
            searchParam: '',
            api: null,
            apis: null,
            url: '',
            method: 'GET',
            param: null,
            json: null,
            editUrl: '',
            editMethod: '',
            editParam: null,
            editJson: null,
            paramItemNum: 1,
            showJsonModalVisible: false,
            addModalVisible: false,
            editModalVisible: false,
            paramModalVisible: false,
            editParamModalVisible: false
        }
    }

    // 新增API
    saveAPI = () => {
        let data = {
            method: this.state.method,
            createTime: moment().format(dateFormat),
            json: JF.toJsonStr(this.state.json)
        };
        if(this.state.method === 'GET'){
            // 校验GET请求URL和JSON参数格式
            data.url = this.state.url;
        }else {
            // 校验POST请求和参数以及JSON参数格式
            data.url = this.state.url;
            data.param = JF.toJsonStr(this.state.param);
        }
        $.ajax({
            url: '/saveAPI',
            data: data,
            method: 'POST',
            dataType: 'JSON',
            success: data => {
                if(data.success){
                    Message.success('创建成功')
                }else{
                    Message.error(data.msg.message)
                }
                this.getAllAPI();
            }
        })
    };

    // 删除API
    deleteAPI = (record) => {
        $.ajax({
            url: '/deleteAPI',
            data: {
                id: record._id
            },
            method: 'POST',
            dataType: 'JSON',
            success: data => {
                if(data.success){
                    Message.success('删除成功');
                }else{
                    Message.error(data.msg)
                }
                this.getAllAPI();
            }
        })
    };

    // 编辑API
    updateAPI = () => {
        let data = {
            id: this.state.api._id,
            method: this.state.editMethod,
            json: JF.toJsonStr(this.state.editJson)
        };
        if(this.state.editMethod === 'GET'){
            data.url = this.state.editUrl;
        }else {
            data.url = this.state.editUrl;
            data.param = JF.toJsonStr(this.state.editParam);
        }
        $.ajax({
            url: '/updateAPI',
            data: data,
            method: 'POST',
            dataType: 'JSON',
            success: data => {
                if(data.success){
                    Message.success('编辑成功');
                }else{
                    Message.error(data.msg)
                }
                this.getAllAPI();
            }
        })
    };

    // 获取全部API
    getAllAPI = () => {
        $.ajax({
            url: '/getAllApi',
            method: 'GET',
            dataType: 'JSON',
            success: data => {
                data.result.map(item=>{
                    item.key = item._id
                });
                if(data.success){
                    this.setState({
                        apis: data.result,
                        searchParam: ''
                    })
                }else{
                    Message.error(data.msg)
                }
            }
        })
    };

    // 通过输入模糊查询API
    getAPIByParam = (e) => {
        this.setState({
            searchParam: e.target.value
        });
        if(!this.state.apis){
            return;
        }
        if(!e.target.value){
            this.getAllAPI();
            return;
        }
        $.ajax({
            url: '/queryByParam',
            data:{
                url: e.target.value
            },
            method: 'POST',
            dataType: 'JSON',
            success: data => {
                data.result.map(item=>{
                    item.key = item._id
                });
                if(data.success){
                    this.setState({
                        apis: data.result
                    })
                }else{
                    Message.error(data.msg)
                }
            }
        })
    };

    sendAPI = (record) => {
        let method = record.method;
        if(method === 'POST'){
            $.ajax({
                url: record.url,
                data: JSON.parse(record.param),
                method: 'POST',
                dataType: 'JSON',
                success: data => {
                    console.log(data)
                }
            })
        }else if(method === 'GET'){
            $.ajax({
                url: record.url,
                method: 'GET',
                dataType: 'JSON',
                success: data => {
                    console.log(data)
                }
            })
        }
    };

    // 查看JSON数据Modal显示
    showJsonModal = (record) => {
        this.setState({
            api: record,
            showJsonModalVisible: true
        })
    };

    // 隐藏JSON数据Modal
    closeShowJsonModal = () => {
        this.setState({
            showJsonModalVisible: false
        })
    };

    // 显示新增API Modal
    showAddModal = () => {
        this.emptyModal();
        this.setState({
            addStatus: false,
            addModalVisible: true
        })
    };

    // 隐藏新增API Modal
    closeAddModal = (bool) => {
        if(!this.isFullFill('add')){
            Message.error('请完整填写表单内容');
            return;
        }
        if(!this.state.addStatus && bool){
            Message.info('请先进行参数校验');
            return;
        }
        if(bool){
            // 校验是否填写完整
            this.saveAPI();
        }
        this.setState({
            addModalVisible: false
        })
    };

    // 显示编辑API Modal
    showEditModal = (record) => {
        this.setState({
            api: record,
            editUrl: record.url,
            editMethod: record.method,
            editParam: record.param,
            editJson: JSON.parse(record.json) instanceof Array ? JF.toJsonObj(JSON.parse(record.json), 1, true) : (JSON.parse(record.json) instanceof Object ? JF.toJsonObj(JSON.parse(record.json), 1, false) : record.json),
            editStatus: false,
            editModalVisible: true
        })
    };

    // 隐藏编辑API Modal
    closeEditModal = (bool) => {
        if(!this.isFullFill('edit')){
            Message.error('请完整填写表单内容');
            return;
        }
        if(!this.state.editStatus && bool){
            Message.info('请先进行参数校验');
            return;
        }
        if(bool){
            // 校验是否填写完整
            this.updateAPI();
        }
        this.setState({
            editModalVisible: false
        })
    };

    // 显示参数配置Modal
    showParamModal = () => {
        this.setState({
            paramStatus: false,
            paramModalVisible: true
        })
    };

    // 隐藏参数配置Modal
    closeParamModal = (bool) => {
        if(!this.state.paramStatus && bool){
            Message.info('请先进行参数校验');
            return;
        }
        if(!bool){
            this.setState({
                param: null
            })
        }
        this.setState({
            paramModalVisible: false
        })
    };

    // 显示编辑参数配置Modal
    showEditParamModal = () => {
        this.setState({
            editParamStatus: false,
            editParamModalVisible: true
        })
    };

    // 隐藏编辑参数配置Modal
    closeEditParamModal = (bool) => {
        if(!this.state.editParamStatus && bool){
            Message.info('请先进行参数校验');
            return;
        }
        if(!bool){
            this.setState({
                editParam: this.state.api.param
            })
        }
        this.setState({
            editParamModalVisible: false
        })
    };

    // 清空新增/编辑Modal
    emptyModal = () => {
        this.setState({
            url: '',
            method: 'GET',
            param: '',
            json: null
        })
    };

    // 设置URL
    setURL = (e) => {
        this.setState({
            url: e.target.value
        })
    };

    // 设置请求类型
    setMethod = (value) => {
        let { url, param } = this.get2Post2Get(value, 'add');
        if(value === 'POST')
            this.setState({
                url,
                param,
                method: value
            });
        else
            this.setState({
                url,
                param: null,
                method: value
            })
    };

    // 设置请求参数
    setParam = (e) => {
        this.setState({
            paramStatus: false,
            param: e.target.value
        })
    };

    // 设置JSON返回
    setJSON = (e) => {
        this.setState({
            json: e.target.value,
            addStatus: false
        })
    };

    // 编辑URL
    setEditURL = (e) => {
        this.setState({
            editUrl: e.target.value
        })
    };

    // 编辑请求类型
    setEditMethod = (value) => {
        let { url, param } = this.get2Post2Get(value, 'edit');
        if(value === 'POST')
            this.setState({
                editUrl: url,
                editParam: param,
                editMethod: value
            });
        else
            this.setState({
                editUrl: url,
                editParam: null,
                editMethod: value
            })
    };

    // 设置请求参数
    setEditParam = (e) => {
        this.setState({
            editParam: e.target.value,
            editParamStatus: false
        })
    };

    // 编辑JSON返回
    setEditJSON = (e) => {
        this.setState({
            editJson: e.target.value,
            editStatus: false
        })
    };

    // 格式化JSON输入=>对象格式(实质:在字符串加上/n/t等)
    formatAndCheckJSON = (type, data) => {
        let result;
        if(JF.isString(data)){
            result = data;
            if(data.indexOf(':') !== -1){
                Notification.warn({
                    message: 'SyntaxWarning',
                    description: (<div>
                        <p>Expecting JSON When Got String With ":".</p>
                        <br/>
                        <p>错误描述:</p>
                        <p>目标字符串存在 ":" , 请考虑是否应为JSON格式</p>
                    </div>),
                });
            }
        }else{
            let {isJSON, errName, errMsg, errStr} = JF.isJSON(data);
            if(!isJSON){
                Notification.error({
                    message: errName,
                    description: (<div>
                        <p>{errMsg}.</p>
                        <br/>
                        {
                            errStr ? (<div><p>错误描述:</p><p>{errStr}</p></div>) : ''
                        }
                    </div>),
                });
                return;
            }else{
                result = JF.diffInputType(data);
            }
        }
        switch (type){
            case 'add':
                Notification.success({
                    message: 'JSON格式校验成功',
                    description: '请点击确定进行保存.',
                });
                this.setState({
                    addStatus: true,
                    json: result
                });
                break;
            case 'edit':
                Notification.success({
                    message: 'JSON格式校验成功',
                    description: '请点击确定进行修改.',
                });
                this.setState({
                    editStatus: true,
                    editJson: result
                });
                break;
            case 'param':
                Notification.success({
                    message: 'POST参数格式校验成功',
                    description: '请点击确定进行保存.',
                });
                this.setState({
                    paramStatus: true,
                    param: result
                });
                break;
            case 'editParam':
                Notification.success({
                    message: 'POST参数格式校验成功',
                    description: '请点击确认进行修改.',
                });
                this.setState({
                    editParamStatus: true,
                    editParam: result
                });
                break;
            default:
                console.log('Invalid Type');
                break;
        }
    };

    // 格式化JSON输入=>字符串
    stringfyJSON = (type, data) => {
        let str;
        if(type === 'add'){
            if(data && typeof data === 'string'){
                str = JF.toJsonStr(data);
            }
            this.setState({
                json: str
            })
        }else if(type === 'edit'){
            if(data && typeof data === 'string'){
                str = JF.toJsonStr(data);
            }
            this.setState({
                editJson: str
            })
        }
    };

    // 判断表单记录是否填写完整
    isFullFill(type){
        let ts = this.state;
        if(type === 'add'){
            if(ts.method === 'GET')
                return (ts.url && ts.method && ts.json);
            else
                return (ts.url && ts.param && ts.method && ts.json);
        }else if(type === 'edit'){
            if(ts.editMethod === 'GET')
                return (ts.editUrl && ts.editMethod && ts.editJson);
            else
                return (ts.editUrl && ts.editParam && ts.editMethod && ts.editJson);
        }
    }

    // POST请求和GET请求之间转换的参数及URL转换
    get2Post2Get(type, context){
        console.log(this.state.editParam);
        let tsMethod,
            tsUrl,
            tsParam,
            url,
            param = {};
        if(context === 'add'){
            tsMethod = this.state.method;
            tsUrl = this.state.url;
            tsParam = this.state.param;
        }else if(context === 'edit'){
            tsMethod = this.state.editMethod;
            tsUrl = this.state.editUrl;
            tsParam = this.state.editParam;
        }
        if(tsMethod === 'GET' && type === 'POST'){
            let urlArr = tsUrl.split('?');
            let paramArr = urlArr[1].split('&');
            url = urlArr[0];
            if(paramArr.length !== 0){
                paramArr.map(item=>{
                    let paramItem;
                    paramItem = item.split('=');
                    param[paramItem[0]] = paramItem[1];
                })
            }
            param = JSON.stringify(param);
        }else if(tsMethod === 'POST' && type === 'GET'){
            let jsonObj = JSON.parse(tsParam);
            let length = JF.getLength(jsonObj);
            if(length === 0){
                url = tsUrl;
            }else if(length === 1){
                for(let k in jsonObj){
                    url = tsUrl + '?' + k + '=' + jsonObj[k];
                }
            }else {
                let count = 0;
                for(let k in jsonObj){
                    if(count === 0){
                        url = tsUrl + '?' + k + '=' + jsonObj[k];
                    }else{
                        url += '&' + k + '=' + jsonObj[k];
                    }
                    count ++;
                }
            }
        }
        return {url, param}
    }

    componentDidMount = () =>{
        this.getAllAPI();
    };

    render() {

        const returnJSON = this.state.api ?  ( JSON.parse(this.state.api.json) instanceof Array ? JF.toJsonObj(JSON.parse(this.state.api.json), 1, true) : ( JSON.parse(this.state.api.json) instanceof Object ? JF.toJsonObj(JSON.parse(this.state.api.json), 1, false) : this.state.api.json)) : null;

        const addParam = (
            <Tooltip placement="top" title="参数配置">
                <Icon style={{cursor: 'pointer',fontSize:16, display: this.state.method === 'GET' ? 'none' : 'block' }} type="plus-circle-o" onClick={()=>this.showParamModal()}/>
            </Tooltip>
        );

        const editParam = (
            <Tooltip placement="top" title="参数配置">
                <Icon style={{cursor: 'pointer',fontSize:16, display: this.state.editMethod === 'GET' ? 'none' : 'block' }} type="plus-circle-o" onClick={()=>this.showEditParamModal()}/>
            </Tooltip>
        );

        const methodSelect = (
            <Select value={this.state.method} onChange={this.setMethod}>
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
            </Select>
        );

        return(
            <section id="container">
                <h2 className="title">接口管理</h2>
                <div className="operations">
                    <Button style={{float: 'right',marginTop: 4}} type="primary" icon="plus" onClick={()=>this.showAddModal()}>创建接口</Button>
                    <Input placeholder="请输入请求路径" style={{width: 250}} value={this.state.searchParam} onChange={this.getAPIByParam}/>
                </div>
                <Table
                    columns={this.tableColumns}
                    dataSource={this.state.apis}
                />
                <Modal
                    visible={this.state.showJsonModalVisible}
                    title={this.state.api ? this.state.api.url : null}
                    onOk={this.closeShowJsonModal}
                    onCancel={this.closeShowJsonModal}>
                    <Input value={returnJSON}
                           autosize={{minRows:15}} type="textarea" onChange={(e)=>this.setJSON(e)} disabled={true}/>
                </Modal>
                <Modal
                    visible={this.state.addModalVisible}
                    title="创建接口"
                    onOk={()=>this.closeAddModal(true)}
                    onCancel={()=>this.closeAddModal(false)}>
                    <div>
                        <Select style={{width: 150}} value={this.state.method} onChange={this.setMethod}>
                            <Option value="GET">GET</Option>
                            <Option value="POST">POST</Option>
                        </Select>
                        <Input placeholder={this.state.method === "GET" ? "请输入GET请求路径,形如:/castor/getUser.json?name=zhangsan&age=23" : "请输入POST请求路径,并添加请求参数"}
                               className="url-input" value={this.state.url} onChange={(e)=>this.setURL(e)} suffix={addParam}/>
                        <div className="op-btns">
                            <Button icon="sync" onClick={()=>this.stringfyJSON('add', this.state.json)}>字符串</Button>
                            <Button icon="sync" onClick={()=>this.formatAndCheckJSON('add', this.state.json)}>格式化并校验参数</Button>
                        </div>
                        <Input value={this.state.json} autosize={{minRows:15}} type="textarea" onChange={(e)=>this.setJSON(e)}/>
                    </div>
                </Modal>
                <Modal
                    visible={this.state.editModalVisible}
                    title={this.state.api ? this.state.api.url : null}
                    onOk={()=>this.closeEditModal(true)}
                    onCancel={()=>this.closeEditModal(false)}>
                    <div>
                        <Select style={{width: 150}} value={this.state.editMethod} onChange={this.setEditMethod}>
                            <Option value="GET">GET</Option>
                            <Option value="POST">POST</Option>
                        </Select>
                        <Input className="url-input" placeholder="请求URL" value={this.state.editUrl} onChange={(e)=>this.setEditURL(e)} suffix={editParam}/>
                        <div className="op-btns">
                            <Button icon="sync" onClick={()=>this.stringfyJSON('edit', this.state.editJson)}>字符串</Button>
                            <Button icon="sync" onClick={()=>this.formatAndCheckJSON('edit', this.state.editJson)}>格式化并校验参数</Button>
                        </div>
                        <Input value={this.state.editJson} autosize={{minRows:15}} type="textarea" onChange={(e)=>this.setEditJSON(e)}/>
                    </div>
                </Modal>
                <Modal
                    style={{ top: 150 }}
                    visible={this.state.paramModalVisible}
                    title="参数配置"
                    onOk={()=>this.closeParamModal(true)}
                    onCancel={()=>this.closeParamModal(false)}>
                    <div>
                        {
                            this.state.method === 'GET' ? null :
                                <Input value={this.state.param} autosize={{minRows:10}} type="textarea" onChange={(e)=>this.setParam(e)}/>
                        }
                    </div>
                    <Button className="op-check-btn" type="check" onClick={()=>this.formatAndCheckJSON('param', this.state.param)}>格式化并校验参数</Button>
                </Modal>
                <Modal
                    style={{ top: 150 }}
                    visible={this.state.editParamModalVisible}
                    title="参数配置"
                    onOk={()=>this.closeEditParamModal(true)}
                    onCancel={()=>this.closeEditParamModal(false)}>
                    <div>
                        {
                            this.state.editMethod === 'GET' ? null :
                                <Input value={this.state.editParam} autosize={{minRows:10}} type="textarea" onChange={(e)=>this.setEditParam(e)}/>
                        }
                        <Button className="op-check-btn" type="check" onClick={()=>this.formatAndCheckJSON('editParam', this.state.editParam)}>格式化并校验参数</Button>
                    </div>
                </Modal>
            </section>
        )
    }

}

export default ApiManage;