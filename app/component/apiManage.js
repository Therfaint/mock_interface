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

const JF = new JsonFormatter();
const DP = new dataParser();

class ApiManage extends React.Component {

    constructor(props) {
        super(props);
        this.tableColumns = [{
            title: '模块名称',
            key: 'moduleName',
            width: 150,
            dataIndex: 'moduleName'
        }, {
            title: '请求路径',
            key: 'url',
            dataIndex: 'url',
            width: 300,
            render: (text, record, index) => (
                <span>{record.url ? record.url : ''}</span>
            )
        }, {
            title: '请求类型',
            key: 'method',
            width: 80,
            render: (text, record, index) => (
                <span>{record.method ? record.method : ''}</span>
            )
        }, {
            title: '创建时间',
            key: 'createTime',
            width: 180,
            render: (text, record, index) => (
                <span>{record.createTime ? record.createTime : ''}</span>
            )
        },
            //     {
            //     title: '返回数据',
            //     key: 'json',
            //     width: 400,
            //     render: (text, record, index) => (
            //         <div className="ellipsis">
            //             <a onClick={() => this.showJsonModal(record)}>{record.json}</a>
            //         </div>
            //     )
            // },
            {
                title: '操作',
                key: 'operations',
                width: 200,
                render: (text, record, index) => {
                    if(record.hasOwnProperty('moduleName')){
                        return ''
                    }else{
                        return (
                            <div>
                                <Button icon="edit" onClick={() => this.showEditModal(record)}>编辑</Button>
                                <Button icon="delete" className="op-btn" onClick={() => this.deleteAPI(record)}>删除</Button>
                                {/*<Button icon="tool" className="op-btn" onClick={()=> this.sendAPI(record)}>测试</Button>*/}
                            </div>
                        )
                    }
                }
            }];
        this.state = {

            addTableParam: null,
            editTableParam: null,
            addTableJson: null,
            editTableJson: null,

            addParamVisible: false,
            editParamVisible: false,
            addJsonVisible: false,
            editJsonVisible: false,

            lastEditParam: '',
            lastAddParam: '',

            addStatus: false,
            editStatus: false,
            paramStatus: false,
            editParamStatus: false,

            searchParam: '',
            searchPro: '',

            api: null,
            apis: null,

            module: this.props.rootId,
            editModule: '',

            url: '',
            method: 'GET',
            description: '',
            param: null,
            json: null,
            editUrl: '',
            editMethod: '',
            editDescription: '',
            editParam: null,
            editJson: null,
            paramItemNum: 1,
            showJsonModalVisible: false,
            addModalVisible: false,
            editModalVisible: false,
            paramModalVisible: false,
            editParamModalVisible: false,

            documentVisible: false,
            projectEditVisible: false,
            rollBackVisible: false,

            opHistory: [],

            pageId: undefined,
            treeData: [],
            importTargetModule: this.props.rootId,
            value: [],

            apiMapObj: {},
            pros: [],
            modules: []
        };
    }

    // 通过接口id数组导入
    importApiById = () => {
        $.ajax({
            url: '/importAPIs.json',
            method: 'POST',
            data: {
                proId: this.state.pageId,
                apiArr: this.state.value,
                proCode: this.props.pro.projectCode,
                moduleId: this.state.importTargetModule
            },
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    Message.success('导入成功');
                    this.getAllAPIByProId();
                    this.getAllPros();
                    this.getAllAPI();
                } else {
                    Message.error(data.msg)
                }
            }
        })
    };

    // 获取全部用于导入的API
    getAllAPI = () => {
        $.ajax({
            url: '/getAllApi.json',
            method: 'GET',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    let apiMapObj = {};
                    data.result.map(item => {
                        let obj = {};
                        obj['label'] = item.description;
                        obj['value'] = item._id;
                        obj['key'] = item._id;
                        if (!apiMapObj.hasOwnProperty(item.refModuleId)) {
                            apiMapObj[item.refModuleId] = [];
                        }
                        apiMapObj[item.refModuleId].push(obj);
                    });
                    this.setState({apiMapObj})
                } else {
                    Message.error(data.msg)
                }
            }
        })
    };

    // 获取全部项目信息
    getAllPros = () => {
        $.ajax({
            url: '/getAllPro.json',
            method: 'GET',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    let pros = [];
                    // 如果和当前项目相同则去除
                    data.result.map(item => {
                        let obj = {};
                        // if (item._id !== this.props.pro._id) {
                        obj['label'] = item.projectName;
                        obj['value'] = item._id;
                        obj['key'] = item._id;
                        // obj['children'] = [];
                        pros.push(obj);
                        // }
                    });
                    this.setState({pros})
                } else {
                    Message.error(data.msg);
                }
            }
        })
    };

    // 获取全部项目信息
    getAllModules = () => {
        $.ajax({
            url: '/getAllModule.json',
            method: 'GET',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    let modules = [];
                    data.result.map(item => {
                        let obj = {};
                        if (item._id !== this.props.pro._id) {
                            obj['label'] = item.description;
                            obj['value'] = item._id;
                            obj['key'] = item._id;
                            obj['proId'] = item.refProId;
                            // obj['children'] = [];
                            modules.push(obj);
                        }
                    });
                    this.setState({modules});
                } else {
                    Message.error(data.msg);
                }
            }
        })
    };

    // 格式化treeData
    formatTreeData = () => {
        let {apiMapObj, pros, modules} = {...this.state}, map = {};
        modules.map((item, index) => {
            if (apiMapObj[item['value']]) {
                item['children'] = apiMapObj[item['value']];
            }
            if (!map.hasOwnProperty(item['proId'])) {
                map[item['proId']] = [];
            }
            if(item.hasOwnProperty('children')){
                map[item['proId']].push(item);
            }
        });
        pros.map((item, index) => {
            if (map[item['value']] && map[item['value']].length) {
                item['children'] = map[item['value']];
            } else {
                pros.splice(index, 1);
            }
        });
        this.setState({
            treeData: pros
        })
    };

    // 新增API
    saveAPI = () => {
        let data = {
            paramTable: JSON.stringify(this.state.addTableParam),
            jsonTable: JSON.stringify(this.state.addTableJson),
            method: this.state.method,
            createTime: moment().format(dateFormat),
            json: JF.toJsonStr(this.state.json),
            description: this.state.description,
            moduleId: this.state.module,
            proId: this.state.pageId,
            proCode: this.props.pro.projectCode
        };
        if (this.state.method === 'GET') {
            // 校验GET请求URL和JSON参数格式
            data.url = this.state.url;
        } else {
            // 校验POST请求和参数以及JSON参数格式
            data.url = this.state.url;
            data.param = JF.toJsonStr(this.state.param);
        }
        $.ajax({
            url: '/saveApi.json',
            data: data,
            method: 'POST',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    Message.success('创建成功');
                } else {
                    Message.error(data.msg.message)
                }
                this.getAllAPIByProId();
            }
        })
    };

    // 删除API
    deleteAPI = (record) => {
        Modal.confirm({
            content: '确认删除？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                $.ajax({
                    url: '/deleteApi.json',
                    data: {
                        id: record._id,
                        proId: this.state.pageId,
                        lastUpdateTime: moment().format(dateFormat)
                    },
                    method: 'POST',
                    dataType: 'JSON',
                    success: data => {
                        if (data.success) {
                            Message.success('删除成功');
                        } else {
                            Message.error(data.msg)
                        }
                        this.getAllAPIByProId();
                    }
                })
            }
        });
    };

    // 编辑API
    updateAPI = () => {
        let data = {
            proCode: this.props.pro.projectCode,
            paramTable: JSON.stringify(this.state.editTableParam),
            jsonTable: JSON.stringify(this.state.editTableJson),
            id: this.state.api._id,
            method: this.state.editMethod,
            json: JF.toJsonStr(this.state.editJson),
            description: this.state.editDescription,
            moduleId: this.state.editModule,
            proId: this.state.pageId,
            lastUpdateTime: moment().format(dateFormat)
        };
        if (this.state.editMethod === 'GET') {
            data.url = this.state.editUrl;
        } else {
            data.url = this.state.editUrl;
            data.param = JF.toJsonStr(this.state.editParam);
        }
        $.ajax({
            url: '/updateApi.json',
            data: data,
            method: 'POST',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    Message.success('编辑成功');
                } else {
                    Message.error(data.msg)
                }
                this.getAllAPIByProId();
            }
        })
    };

    // 获取全部模块
    getAllModuleByProId = (map) => {
        $.ajax({
            url: '/getAllModuleById.json?proId=' + this.props.pro._id,
            method: 'GET',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    data.result.map(item => {
                        item.key = item._id;
                        if (map[item['_id']]) {
                            item['children'] = map[item['_id']];
                        }
                    });
                    this.setState({
                        apis: data.result
                    })
                } else {
                    Message.error(data.msg)
                }
            }
        })
    };

    // 获取全部API
    getAllAPIByProId = () => {
        $.ajax({
            url: '/getAllApiById.json?proId=' + this.props.pro._id,
            method: 'GET',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    let map = {};
                    data.result.map(item => {
                        item.key = item._id;
                        let arr = item.url.split('/');
                        arr.splice(0, 2);
                        item.url = '/' + arr.join('/');
                        if (!map.hasOwnProperty(item['refModuleId'])) {
                            map[item['refModuleId']] = [];
                        }
                        map[item['refModuleId']].push(item);
                    });
                    this.getAllModuleByProId(map);
                    this.setState({
                        searchParam: ''
                    })
                } else {
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
        if (!this.state.apis) {
            return;
        }
        if (!e.target.value) {
            this.getAllAPIByProId();
            return;
        }
        $.ajax({
            url: '/queryByParam.json',
            data: {
                proCode: this.props.pro.projectCode,
                url: e.target.value
            },
            method: 'POST',
            dataType: 'JSON',
            success: data => {
                data.result.map(item => {
                    item.key = item._id;
                    let arr = item.url.split('/');
                    arr.splice(0, 2);
                    item.url = '/' + arr.join('/');
                });
                if (data.success) {
                    this.setState({
                        apis: data.result
                    })
                } else {
                    Message.error(data.msg)
                }
            }
        })
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
        if (!this.isFullFill('add') && bool) {
            Message.error('请完整填写表单内容');
            return;
        }
        if (this.state.url.charAt(0) !== '/' && bool) {
            Message.error('请正确填写请求路径,以 / 开头');
            return;
        }
        if (!this.state.addStatus && bool) {
            Message.info('请先进行参数校验');
            return;
        }
        if (bool) {
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
            editModule: record.refModuleId,
            api: record,
            editUrl: record.url,
            editMethod: record.method,
            editParam: record.param,
            editTableParam: record.paramTable ? JSON.parse(record.paramTable) : null,
            editJson: JF.isString(record.json) ? record.json : (JSON.parse(record.json) instanceof Array ? JF.toJsonObj(JSON.parse(record.json), 1, true) : (JSON.parse(record.json) instanceof Object ? JF.toJsonObj(JSON.parse(record.json), 1, false) : null)),
            editTableJson: record.jsonTable ? JSON.parse(record.jsonTable) : null,
            editDescription: record.description,
            editStatus: false,
            editModalVisible: true
        })
    };

    // 隐藏编辑API Modal
    closeEditModal = (bool) => {
        if (!this.isFullFill('edit') && bool) {
            Message.error('请完整填写表单内容');
            return;
        }
        if (this.state.editUrl.charAt(0) !== '/' && bool) {
            Message.error('请正确填写请求路径,以 / 开头');
            return;
        }
        if (!this.state.editStatus && bool) {
            Message.info('请先进行参数校验');
            return;
        }
        if (bool) {
            // 校验是否填写完整
            this.updateAPI();
        }
        this.setState({
            editModalVisible: false
        })
    };

    // 显示参数配置Modal
    showParamModal = () => {
        let newState = {};
        newState['paramStatus'] = false;
        newState['paramModalVisible'] = true;
        if (this.state.addTableParam) {
            let isArray = DP.isArray(this.state.addTableParam);
            newState['param'] = JF.toJsonObj(DP.dataSourceFill(this.state.addTableParam), 1, isArray);
        }
        this.setState(newState);
    };

    // 隐藏参数配置Modal
    closeParamModal = (bool) => {
        let newState = {};
        newState['paramModalVisible'] = false;
        if (!this.state.paramStatus && bool) {
            Message.info('请先进行参数校验');
            return;
        }
        if (this.state.method === 'GET' && bool) {
            let {url} = this.get2Post2Get('setParamStr', 'add');
            newState['url'] = url;
        }
        this.setState(newState)
    };

    // 显示编辑参数配置Modal
    showEditParamModal = () => {
        let newState = {};
        newState['editParamStatus'] = false;
        newState['editParamModalVisible'] = true;
        if (this.state.editTableParam) {
            let isArray = DP.isArray(this.state.editTableParam);
            newState['editParam'] = JF.toJsonObj(DP.dataSourceFill(this.state.editTableParam), 1, isArray);
        }
        this.setState(newState);
    };

    // 隐藏编辑参数配置Modal
    closeEditParamModal = (bool) => {
        let newState = {};
        newState['editParamModalVisible'] = false;
        if (!this.state.editParamStatus && bool) {
            Message.info('请先进行参数校验');
            return;
        }
        if (this.state.editMethod === 'GET' && bool) {
            let {url} = this.get2Post2Get('setParamStr', 'edit');
            newState['editUrl'] = url;
        }
        this.setState(newState)
    };

    // 清空新增/编辑Modal
    emptyModal = () => {
        this.setState({
            module: this.props.rootId,
            url: '',
            method: 'GET',
            description: '',
            addTableParam: null,
            param: '',
            json: '',
            addTableJson: null
        })
    };

    setModule = (value) => {
        this.setState({
            module: value
        })
    };

    // 设置URL
    setURL = (e) => {
        this.setState({
            url: e.target.value
        })
    };

    // 设置接口描述
    setDesc = (e) => {
        this.setState({
            description: e.target.value
        })
    };

    // 设置请求类型
    setMethod = (value) => {
        let {url, param} = this.get2Post2Get(value, 'add');
        if (value === 'POST')
            this.setState({
                url,
                param,
                method: value
            });
        else
            this.setState({
                url,
                method: value
            })
    };

    // 设置请求参数
    setParam = (e) => {
        this.setState({
            paramStatus: false,
            param: e.target.value,
            addTableParam: JF.updateJsonToTable(e.target.value, this.state.addTableParam)
        })
    };

    // 设置JSON返回
    setJSON = (e) => {
        this.setState({
            json: e.target.value,
            addStatus: false,
            addTableJson: JF.updateJsonToTable(e.target.value, this.state.addTableJson)
        });
    };

    // 编辑URL
    setEditURL = (e) => {
        this.setState({
            editUrl: e.target.value
        })
    };

    setEditModule = (value) => {
        this.setState({
            editModule: value
        })
    };

    setTargetModule = (value) => {
        this.setState({
            importTargetModule: value
        })
    };

    // 编辑请求类型
    setEditMethod = (value) => {
        let {url, param} = this.get2Post2Get(value, 'edit');
        if (value === 'POST')
            this.setState({
                editUrl: url,
                editParam: param,
                editMethod: value
            });
        else
            this.setState({
                editUrl: url,
                editMethod: value
            })
    };

    // 编辑URL
    setEditDesc = (e) => {
        this.setState({
            editDescription: e.target.value
        })
    };

    // 设置请求参数
    setEditParam = (e) => {
        this.setState({
            editParam: e.target.value,
            editParamStatus: false,
            editTableParam: JF.updateJsonToTable(e.target.value, this.state.editTableParam)
        })
    };

    // 编辑JSON返回
    setEditJSON = (e) => {
        this.setState({
            editJson: e.target.value,
            editStatus: false,
            editTableJson: JF.updateJsonToTable(e.target.value, this.state.editTableJson)
        });
    };

    // 格式化JSON输入=>对象格式(实质:在字符串加上/n/t等)
    formatAndCheckJSON = (type, data) => {
        let result;
        if (!data) {
            Message.warn('请填写具体内容后再进行校验');
            return;
        }
        if (JF.isString(data)) {
            result = data;
            if (data.indexOf(':') !== -1) {
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
        } else {
            let {isJSON, errName, errMsg, errStr} = JF.isJSON(data);
            if (!isJSON) {
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
            } else {
                result = JF.diffInputType(data);
            }
        }
        switch (type) {
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
    stringifyJSON = (type, data) => {
        let str;
        if (type === 'add') {
            if (data && typeof data === 'string') {
                str = JF.toJsonStr(data);
            }
            this.setState({
                json: str
            })
        } else if (type === 'edit') {
            if (data && typeof data === 'string') {
                str = JF.toJsonStr(data);
            }
            this.setState({
                editJson: str
            })
        }
    };

    // 判断表单记录是否填写完整
    isFullFill(type) {
        let ts = this.state;
        if (type === 'add') {
            if (ts.method === 'GET')
                return (ts.url && ts.method && ts.json && ts.description && ts.module);
            else
                return (ts.url && ts.param && ts.method && ts.json && ts.description && ts.module);
        } else if (type === 'edit') {
            if (ts.editMethod === 'GET')
                return (ts.editUrl && ts.editMethod && ts.editJson && ts.editDescription && ts.editModule);
            else
                return (ts.editUrl && ts.editParam && ts.editMethod && ts.editJson && ts.editDescription && ts.editModule);
        }
    };

    // POST请求和GET请求之间转换的参数及URL转换
    get2Post2Get = (type, context) => {
        let tsMethod,
            tsUrl,
            tsParam,
            url,
            param = {};
        if (context === 'add') {
            tsMethod = this.state.method;
            tsUrl = this.state.url;
            tsParam = this.state.param;
        } else if (context === 'edit') {
            tsMethod = this.state.editMethod;
            tsUrl = this.state.editUrl;
            tsParam = this.state.editParam;
        }
        if (tsMethod === 'GET' && type === 'POST') {
            if (tsUrl && tsUrl.indexOf('?') !== -1) {
                let urlArr = tsUrl.split('?');
                let paramArr = urlArr[1].split('&');
                url = urlArr[0];
                if (paramArr.length !== 0) {
                    paramArr.map(item => {
                        let paramItem;
                        paramItem = item.split('=');
                        param[paramItem[0]] = paramItem[1];
                    })
                }
                param = JSON.stringify(param);
            } else {
                url = tsUrl;
                param = null;
            }
        } else if (tsMethod === 'POST' && type === 'GET' || type === 'setParamStr') {
            let jsonObj = JSON.parse(tsParam);
            let length = JF.getLength(jsonObj);
            // 已经存在参数
            if (tsUrl.indexOf('?') !== -1) {
                tsUrl = tsUrl.split('?')[0];
            }
            if (length === 0) {
                url = tsUrl;
            } else if (length === 1) {
                for (let k in jsonObj) {
                    url = tsUrl + '?' + k + '=' + jsonObj[k];
                }
            } else {
                let count = 0;
                for (let k in jsonObj) {
                    if (count === 0) {
                        url = tsUrl + '?' + k + '=' + jsonObj[k];
                    } else {
                        url += '&' + k + '=' + jsonObj[k];
                    }
                    count++;
                }
            }
        }
        return {url, param}
    };

    showEditTable = (type) => {
        let visible = {};
        visible[type] = true;
        this.setState(visible)
    };

    // 保存编辑框
    onOk = (value, tar, table, visible) => {
        let state = {};
        let isArray = DP.isArray(value);
        state[tar] = JF.toJsonObj(DP.dataSourceFill(value), 1, isArray);
        state[visible] = false;
        state[table] = value;
        this.setState(state);
    };

    // 关闭编辑框
    onCancel = (type) => {
        let visible = {};
        visible[type] = false;
        this.setState(visible);
    };

    showDocument = () => {
        this.setState({
            documentVisible: true
        })
    };

    closeDocument = () => {
        this.setState({
            documentVisible: false
        })
    };

    showRollBack = () => {
        this.setState({
            rollBackVisible: true
        })
    };

    closeRollBack = () => {
        this.setState({
            rollBackVisible: false
        })
    };

    showEditProject = () => {
        this.formatTreeData();
        this.setState({
            value: [],
            importTargetModule: this.props.rootId,
            projectEditVisible: true
        })
    };

    closeEditProject = (bool) => {
        if (bool && !this.state.value.length) {
            Message.info('请选择具体接口');
            return;
        }
        if (bool) {
            // 发送导入请求
            // 参数为导入项目id + 被导入的接口id或项目id
            this.importApiById();
        }
        this.setState({
            projectEditVisible: false
        })
    };

    componentWillReceiveProps = () => {
        this.getAllAPIByProId();
    };

    componentWillMount = () => {
        this.setState({pageId: this.props.pro._id, module: this.props.rootId});
        this.getAllAPI();
        this.getAllPros();
        this.getAllModules();
        this.getAllAPIByProId();
    };

    componentDidMount = () => {

    };

    onChange = (value) => {
        this.setState({value});
    };

    clearInput = () => {
        this.setState({searchParam: ''});
        this.getAllAPIByProId();
    };

    render() {

        const tProps = {
            treeData: this.state.treeData,
            value: this.state.value,
            onChange: this.onChange,
            treeCheckable: true,
            multiple: true,
            allowClear: true,
            style: {
                width: 488
            },
        };

        const returnJSON = this.state.api ? ( JF.isString(this.state.api.json) ? this.state.api.json : (JSON.parse(this.state.api.json) instanceof Array ? JF.toJsonObj(JSON.parse(this.state.api.json), 1, true) : ( JSON.parse(this.state.api.json) instanceof Object ? JF.toJsonObj(JSON.parse(this.state.api.json), 1, false) : null))) : null;

        const addParam = (
            <Tooltip placement="top" title="参数配置">
                <Icon style={{cursor: 'pointer', fontSize: 16}} type="plus-circle-o"
                      onClick={() => this.showParamModal()}/>
            </Tooltip>
        );

        const editParam = (
            <Tooltip placement="top" title="参数配置">
                <Icon style={{cursor: 'pointer', fontSize: 16}} type="plus-circle-o"
                      onClick={() => this.showEditParamModal()}/>
            </Tooltip>
        );

        const addFooter = [
            <Button key="addCancel" size="large" onClick={() => this.closeParamModal(false)}>取消</Button>,
            <Button key="addSubmit" type="primary" size="large" onClick={() => this.closeParamModal(true)}>确定</Button>
        ];

        const editFooter = [
            <Button key="editCancel" size="large" onClick={() => this.closeEditParamModal(false)}>取消</Button>,
            <Button key="editSubmit" type="primary" size="large"
                    onClick={() => this.closeEditParamModal(true)}>确定</Button>
        ];

        return (
            <section id="container">
                <div className="title">
                    <span style={{fontSize: 20, fontWeight: 'bold'}}>接口配置</span>
                    <Icon style={{fontSize: 18, marginLeft: 9, cursor: 'pointer'}} type="plus-circle-o"
                          onClick={() => this.showAddModal()}/>
                    <div style={{position: 'absolute', top: 3, left: 166}}>
                        <Input placeholder="请输入请求路径" style={{width: 250, marginLeft: 9}} value={this.state.searchParam}
                               onChange={this.getAPIByParam} suffix={ this.state.searchParam ?
                            <Icon type="close-circle" className="clear-input" onClick={this.clearInput}/> : null}/>
                    </div>
                    <div className="header-btns">
                        <span className="header-btn" onClick={this.showEditProject}>
                            <Icon type="setting"/>接口导入
                        </span>
                        <span className="header-btn" style={{marginLeft: 12}} onClick={this.showRollBack}>
                            <Icon type="rocket"/>数据回滚
                        </span>
                        <span className="header-btn" style={{marginLeft: 12}} onClick={this.showDocument}>
                            <Icon type="info-circle-o"/>使用说明
                        </span>
                    </div>
                </div>
                <Table
                    columns={this.tableColumns}
                    dataSource={this.state.apis}
                    defaultExpandAllRows={true}
                    pagination={false}
                    scroll={{y: 600}}
                />
                <Modal
                    visible={this.state.showJsonModalVisible}
                    title={this.state.api ? this.state.api.url : null}
                    maskClosable={false}
                    onOk={this.closeShowJsonModal}
                    onCancel={this.closeShowJsonModal}>
                    <Input value={returnJSON}
                           autosize={{minRows: 15}} type="textarea" onChange={(e) => this.setJSON(e)} disabled={true}/>
                </Modal>
                <Modal
                    visible={this.state.addModalVisible}
                    title="创建接口"
                    maskClosable={false}
                    onOk={() => this.closeAddModal(true)}
                    onCancel={() => this.closeAddModal(false)}>
                    <div>
                        <div>
                            <Select style={{width: 150, marginBottom: 9}} value={this.state.module}
                                    onChange={this.setModule}>
                                {
                                    this.props.module.map(item => {
                                        return (<Option key={item._id}>{item.moduleName}</Option>)
                                    })
                                }
                            </Select>
                        </div>
                        <div>
                            <Select style={{width: 150, marginBottom: 9}} value={this.state.method}
                                    onChange={this.setMethod}>
                                <Option value="GET">GET</Option>
                                <Option value="POST">POST</Option>
                            </Select>
                        </div>
                        <Input addonBefore={`/${this.props.pro.projectCode}`}
                               placeholder={this.state.method === "GET" ? "请输入GET请求路径,形如:/getUser.json,并添加请求参数" : "请输入POST请求路径,并添加请求参数"}
                               value={this.state.url} onChange={(e) => this.setURL(e)} suffix={addParam}/>
                        <Input placeholder={"请输入接口描述"} className="url-input" value={this.state.description}
                               onChange={(e) => this.setDesc(e)}/>
                        <div className="op-btns">
                            <Button className="json-btns"
                                    onClick={() => this.showEditTable('addJsonVisible')}>JSON编辑</Button>
                            <Button className="json-btns" onClick={() => this.stringifyJSON('add', this.state.json)}>字符串化</Button>
                            <Button className="json-btns"
                                    onClick={() => this.formatAndCheckJSON('add', this.state.json)}>格式化并校验</Button>
                        </div>
                        <Input value={this.state.json} style={{marginTop: 9}} autosize={{minRows: 15}} type="textarea"
                               onChange={(e) => this.setJSON(e)}/>
                    </div>
                </Modal>
                <Modal
                    style={{top: 150}}
                    visible={this.state.paramModalVisible}
                    title="参数配置"
                    maskClosable={false}
                    closable={false}
                    footer={addFooter}>
                    <div>
                        {
                            <Input value={this.state.param} style={{marginBottom: 5}} autosize={{minRows: 10}}
                                   type="textarea" onChange={(e) => this.setParam(e)}/>
                        }
                    </div>
                    <Button onClick={() => this.showEditTable('addParamVisible')}>参数编辑</Button>
                    <Button className="json-btns" type="check"
                            onClick={() => this.formatAndCheckJSON('param', this.state.param)}>格式化并校验</Button>
                </Modal>
                <Modal
                    visible={this.state.editModalVisible}
                    title={this.state.api ? this.state.api.url : null}
                    maskClosable={false}
                    onOk={() => this.closeEditModal(true)}
                    onCancel={() => this.closeEditModal(false)}>
                    <div>
                        <div>
                            <Select style={{width: 150, marginBottom: 9}} value={this.state.editModule}
                                    onChange={this.setEditModule}>
                                {
                                    this.props.module.map(item => {
                                        return (<Option key={item._id}>{item.moduleName}</Option>)
                                    })
                                }
                            </Select>
                        </div>
                        <div>
                            <Select style={{width: 150, marginBottom: 9}} value={this.state.editMethod}
                                    onChange={this.setEditMethod}>
                                <Option value="GET">GET</Option>
                                <Option value="POST">POST</Option>
                            </Select>
                        </div>
                        <Input addonBefore={`/${this.props.pro.projectCode}`} placeholder="请求URL"
                               value={this.state.editUrl} onChange={(e) => this.setEditURL(e)} suffix={editParam}/>
                        <Input placeholder={"请输入接口描述"} className="url-input" value={this.state.editDescription}
                               onChange={(e) => this.setEditDesc(e)}/>
                        <div className="op-btns">
                            <Button onClick={() => this.showEditTable('editJsonVisible')}>JSON编辑</Button>
                            <Button className="json-btns"
                                    onClick={() => this.stringifyJSON('edit', this.state.editJson)}>字符串化</Button>
                            <Button className="json-btns"
                                    onClick={() => this.formatAndCheckJSON('edit', this.state.editJson)}>格式化并校验</Button>
                        </div>
                        <Input value={this.state.editJson} style={{marginTop: 9}} autosize={{minRows: 15}}
                               type="textarea" onChange={(e) => this.setEditJSON(e)}/>
                    </div>
                </Modal>
                <Modal
                    style={{top: 150}}
                    visible={this.state.editParamModalVisible}
                    closable={false}
                    title="参数配置"
                    maskClosable={false}
                    footer={editFooter}>
                    <div>
                        {
                            <Input value={this.state.editParam} style={{marginBottom: 5}} autosize={{minRows: 10}}
                                   type="textarea" onChange={(e) => this.setEditParam(e)}/>
                        }
                        <Button onClick={() => this.showEditTable('editParamVisible')}>参数编辑</Button>
                        <Button className="json-btns"
                                onClick={() => this.formatAndCheckJSON('editParam', this.state.editParam)}>格式化并校验</Button>
                    </div>
                </Modal>
                <Modal
                    visible={this.state.rollBackVisible}
                    title="历史记录"
                    maskClosable={false}
                    onOk={this.closeRollBack}
                    onCancel={this.closeRollBack}>
                    <div>
                        敬请期待
                    </div>
                </Modal>
                <Modal
                    visible={this.state.documentVisible}
                    title="使用说明"
                    maskClosable={false}
                    onOk={this.closeDocument}
                    onCancel={this.closeDocument}>
                    <div>
                        敬请期待
                    </div>
                </Modal>
                <Modal
                    visible={this.state.projectEditVisible}
                    title="接口导入"
                    maskClosable={false}
                    onOk={() => this.closeEditProject(true)}
                    onCancel={() => this.closeEditProject(false)}>
                    <div>
                        <Select style={{width: 150, marginBottom: 9}} value={this.state.importTargetModule}
                                onChange={this.setTargetModule}>
                            {
                                this.props.module.map(item => {
                                    return (<Option key={item._id}>{item.moduleName}</Option>)
                                })
                            }
                        </Select>
                        <TreeSelect {...tProps}/>
                    </div>
                </Modal>
                <ParamTable visible={this.state.addParamVisible} key="addParam" title="参数配置表"
                            dataSource={this.state.addTableParam}
                            onOk={(value) => this.onOk(value, 'param', 'addTableParam', 'addParamVisible')}
                            onCancel={() => this.onCancel('addParamVisible')}/>
                <ParamTable visible={this.state.editParamVisible} key="editParam" title="参数配置表"
                            dataSource={this.state.editTableParam}
                            onOk={(value) => this.onOk(value, 'editParam', 'editTableParam', 'editParamVisible')}
                            onCancel={() => this.onCancel('editParamVisible')}/>
                <ParamTable visible={this.state.addJsonVisible} key="addJson" title="Json配置表"
                            dataSource={this.state.addTableJson}
                            onOk={(value) => this.onOk(value, 'json', 'addTableJson', 'addJsonVisible')}
                            onCancel={() => this.onCancel('addJsonVisible')}/>
                <ParamTable visible={this.state.editJsonVisible} key="editJson" title="Json配置表"
                            dataSource={this.state.editTableJson}
                            onOk={(value) => this.onOk(value, 'editJson', 'editTableJson', 'editJsonVisible')}
                            onCancel={() => this.onCancel('editJsonVisible')}/>
            </section>
        )
    }

}

export default ApiManage;
//todo: 点击编辑JSON进行绑定 先校验