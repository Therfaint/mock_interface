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
import Tabs from 'antd/lib/tabs';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

import JsonFormatter from '../util/JSON_Format'

import ParamTable from './editable_param_table';

import dataParser from '../util/Data_Parser';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

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
        }, {
            title: '操作',
            key: 'operations',
            width: 210,
            render: (text, record, index) => {
                if (record.hasOwnProperty('moduleName')) {
                    return ''
                } else {
                    return (
                        <div>
                            <Button icon="edit" onClick={() => this.showEditModal(record)}>编辑</Button>
                            <Button icon="delete" className="op-btn" onClick={() => this.deleteAPI(record)}>删除</Button>
                            <Button icon="rocket" className="op-btn"
                                    onClick={() => this.showRollBack(record)}>历史</Button>
                        </div>
                    )
                }
            }
        }];
        this.rollbackColumns = [{
            title: '版本信息',
            key: 'version',
            width: 88,
            render: (text, record, index) => (
                <span>{'版本' + (index + 1)}</span>
            )
        }, {
            title: '操作时间',
            key: 'opTime',
            dataIndex: 'opTime',
            width: 180
        }, {
            title: '操作用户',
            key: 'opUser',
            dataIndex: 'opUser',
            render: (text, record, index) => (
                <span>-</span>
            )
        }, {
            title: '操作',
            key: 'operations',
            width: 88,
            render: (text, record, index) => {
                return (
                    <div>
                        <Button icon="backward" onClick={() => this.rollbackApi(record)}>回滚</Button>
                    </div>
                )
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
            modules: [],

            apiHis: []
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
                            obj['label'] = item.moduleName;
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
        modules.map(item => {
            if (apiMapObj[item['value']]) {
                item['children'] = apiMapObj[item['value']];
            }
            if (!map.hasOwnProperty(item['proId'])) {
                map[item['proId']] = [];
            }
            if (item.hasOwnProperty('children')) {
                map[item['proId']].push(item);
            }
        });
        pros.map(item => {
            if (map[item['value']] && map[item['value']].length) {
                item['children'] = map[item['value']];
            }
        });
        for (let i = 0; i < pros.length; i++) {
            if (!pros[i].hasOwnProperty('children')) {
                pros.splice(i, 1);
            }
        }
        this.setState({
            treeData: pros
        })
    };

    // 根据id获取历史记录
    getHisById = (record) => {
        $.ajax({
            url: '/getHisById.json',
            data: {
                id: record._id
            },
            method: 'GET',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    data.result.map(item => {
                        item.key = item._id;
                    });
                    this.setState({
                        apiHis: data.result
                    })
                } else {
                    Message.error(data.msg)
                }
            }
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

    // todo回滚单条接口
    rollbackApi = (record) => {
        let data = {
            id: record.refApiId,
            param: record.api
        };
        $.ajax({
            url: '/hisRollback.json',
            data: data,
            method: 'POST',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    Message.success('接口回滚成功');
                    this.setState({
                        rollBackVisible: false
                    })
                } else {
                    Message.error(data.msg);
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
        if(bool && !this.isInvalidTableDS(this.state.addTableParam, 'param')){
            Message.error('请完整填写输入参数');
            return;
        }
        if(bool && !this.isInvalidTableDS(this.state.addTableJson, 'json')){
            Message.error('请完整填写输出参数');
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
        let editTableParam, editJson, editTableJson;
        editTableParam = (record.paramTable ? JSON.parse(record.paramTable) : null);
        editJson = (JF.isString(record.json) ? record.json : (JSON.parse(record.json) instanceof Array ? JF.toJsonObj(JSON.parse(record.json), 1, true) : (JSON.parse(record.json) instanceof Object ? JF.toJsonObj(JSON.parse(record.json), 1, false) : null)));
        editTableJson = (record.jsonTable ? JSON.parse(record.jsonTable) : null);
        this.setState({
            editModule: record.refModuleId,
            api: record,
            editUrl: record.url,
            editMethod: record.method,
            editTableParam,
            editJson,
            editTableJson,
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
        if( bool && !this.isInvalidTableDS(this.state.editTableParam, 'param') ){
            Message.error('请完整填写输入参数');
            return;
        }
        if( bool && !this.isInvalidTableDS(this.state.editTableJson, 'json') ){
            Message.error('请完整填写输出参数');
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

    // 清空新增/编辑Modal
    emptyModal = () => {
        this.setState({
            module: this.props.rootId,
            url: '',
            method: 'GET',
            description: '',
            addTableParam: null,
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
        if (value === 'POST')
            this.setState({
                method: value
            });
        else
            this.setState({
                method: value
            })
    };

    // 设置请求参数
    setParam = (e) => {
        this.setState({
            param: e.target.value,
            addTableParam: JF.updateJsonToTable(e.target.value, this.state.addTableParam)
        })
    };

    // 设置JSON返回
    setJSON = (e) => {
        this.setState({
            json: e.target.value,
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
        // let {url, param} = this.get2Post2Get(value, 'edit');
        if (value === 'POST')
            this.setState({
                editMethod: value
            });
        else
            this.setState({
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
            // editParamStatus: false,
            editTableParam: JF.updateJsonToTable(e.target.value, this.state.editTableParam)
        })
    };

    // 编辑JSON返回
    setEditJSON = (e) => {
        this.setState({
            editJson: e.target.value,
            // editStatus: false,
            editTableJson: JF.updateJsonToTable(e.target.value, this.state.editTableJson)
        });
    };

    // 格式化JSON输入=>对象格式(实质:在字符串加上/n/t等)
    formatAndCheckJSON = (type, data, bool) => {
        let result, table, state = {};
        if (!data && bool) {
            Message.warn('格式化内容不能为空');
            return;
        }else if (!data && !bool){
            Message.warn('导入表格输入不能为空');
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
                if(!result){
                    Message.error('解析失败 请校验输入格式是否正确');
                    return;
                }
                if (type === 'add' && !bool) {
                    table = JF.updateJsonToTable(result, this.state.addTableJson)
                } else {
                    table = JF.updateJsonToTable(result, this.state.editTableJson)
                }
            }
        }
        switch (type) {
            case 'add':
                state['json'] = result;
                if (!bool) {
                    state['addTableJson'] = table;
                }
                this.setState(state);
                break;
            case 'edit':
                state['editJson'] = result;
                if (!bool) {
                    state['editTableJson'] = table;
                }
                this.setState(state);
                break;
            case 'param':
                this.setState({
                    // paramStatus: true,
                    param: result,
                });
                break;
            case 'editParam':
                this.setState({
                    // editParamStatus: true,
                    editParam: result,
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
            // if (ts.method === 'GET')
            return (ts.url && ts.method && ts.description && ts.module && ts.addTableJson);
            // else
            //     return (ts.url && ts.method && ts.json && ts.description && ts.module);
        } else if (type === 'edit') {
            // if (ts.editMethod === 'GET')
            return (ts.editUrl && ts.editMethod && ts.editTableJson && ts.editDescription && ts.editModule);
            // else
            //     return (ts.editUrl && ts.editMethod && ts.editJson && ts.editDescription && ts.editModule);
        }
    };

    // // POST请求和GET请求之间转换的参数及URL转换
    // get2Post2Get = (type, context) => {
    //     let tsMethod,
    //         tsUrl,
    //         tsParam,
    //         url,
    //         param = {};
    //     if (context === 'add') {
    //         tsMethod = this.state.method;
    //         tsUrl = this.state.url;
    //         tsParam = this.state.param;
    //     } else if (context === 'edit') {
    //         tsMethod = this.state.editMethod;
    //         tsUrl = this.state.editUrl;
    //         tsParam = this.state.editParam;
    //     }
    //     if (tsMethod === 'GET' && type === 'POST') {
    //         if (tsUrl && tsUrl.indexOf('?') !== -1) {
    //             let urlArr = tsUrl.split('?');
    //             let paramArr = urlArr[1].split('&');
    //             url = urlArr[0];
    //             if (paramArr.length !== 0) {
    //                 paramArr.map(item => {
    //                     let paramItem;
    //                     paramItem = item.split('=');
    //                     param[paramItem[0]] = paramItem[1];
    //                 })
    //             }
    //             param = JSON.stringify(param);
    //         } else {
    //             url = tsUrl;
    //             param = null;
    //         }
    //     } else if (tsMethod === 'POST' && type === 'GET' || type === 'setParamStr') {
    //         let jsonObj = JSON.parse(tsParam);
    //         let length = JF.getLength(jsonObj);
    //         // 已经存在参数
    //         if (tsUrl.indexOf('?') !== -1) {
    //             tsUrl = tsUrl.split('?')[0];
    //         }
    //         if (length === 0) {
    //             url = tsUrl;
    //         } else if (length === 1) {
    //             for (let k in jsonObj) {
    //                 url = tsUrl + '?' + k + '=' + jsonObj[k];
    //             }
    //         } else {
    //             let count = 0;
    //             for (let k in jsonObj) {
    //                 if (count === 0) {
    //                     url = tsUrl + '?' + k + '=' + jsonObj[k];
    //                 } else {
    //                     url += '&' + k + '=' + jsonObj[k];
    //                 }
    //                 count++;
    //             }
    //         }
    //     }
    //     return {url, param}
    // };

    showEditTable = (type) => {
        let visible = {};
        visible[type] = true;
        this.setState(visible)
    };

    // 保存编辑框
    onOk = (value, tar, table) => {
        let state = {};
        let isArray = DP.isArray(value);
        if (tar) {
            state[tar] = JF.toJsonObj(DP.dataSourceFill(value), 1, isArray);
        }
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

    showRollBack = (record) => {
        this.getHisById(record);
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

    isInvalidTableDS = (table, type) => {
        let status = true;
        if(!table && type === 'param'){
            return status
        }else{
            table.map(item=>{
                if(!item.paramType.length){
                    status = false;
                }
                if(item.hasOwnProperty('children')){
                    this.isInvalidTableDS(item.children);
                }
            });
            return status;
        }
    };

    clearInput = () => {
        this.setState({searchParam: ''});
        this.getAllAPIByProId();
    };w

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

        return (
            <section id="container">
                <div className="title">
                    <span style={{fontSize: 20, fontWeight: 'bold'}}>接口配置</span>
                    <Icon style={{fontSize: 18, marginLeft: 9, cursor: 'pointer'}} type="plus-circle-o"
                          onClick={() => this.showAddModal()}/>
                    <div style={{position: 'absolute', top: 3, left: 166}}>
                        <Input placeholder="请输入请求路径" style={{width: 250, marginLeft: 9}} value={this.state.searchParam}
                               onChange={this.getAPIByParam}  suffix={ this.state.searchParam ? <Icon type="close-circle" className="clear-input" onClick={this.clearInput}/> : null}/>
                    </div>
                    <div className="header-btns">
                        <span className="header-btn" onClick={this.showEditProject}>
                            <Icon type="setting"/>接口导入
                        </span>
                        {/*<span className="header-btn" style={{marginLeft: 12}} onClick={this.showRollBack}>*/}
                        {/*<Icon type="rocket"/>历史记录*/}
                        {/*</span>*/}
                        {/*<span className="header-btn" style={{marginLeft: 12}} onClick={this.showDocument}>*/}
                        {/*<Icon type="info-circle-o"/>使用说明*/}
                        {/*</span>*/}
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
                    visible={this.state.addModalVisible}
                    title="创建接口"
                    width={1280}
                    maskClosable={false}
                    onOk={() => this.closeAddModal(true)}
                    onCancel={() => this.closeAddModal(false)}>
                    <div>
                        <div className="api-input-area">
                            <div style={{marginBottom: 15}}>
                                <span>接口模块</span>
                                <Select style={{width: 250, marginLeft: 21}} value={this.state.module}
                                        onChange={this.setModule}>
                                    {
                                        this.props.module.map(item => {
                                            return (<Option key={item._id}>{item.moduleName}</Option>)
                                        })
                                    }
                                </Select>
                            </div>
                            <div style={{marginBottom: 15}}>
                                <span>请求类型</span>
                                <Select style={{width: 250, marginLeft: 21}} value={this.state.method}
                                        onChange={this.setMethod}>
                                    <Option value="GET">GET</Option>
                                    <Option value="POST">POST</Option>
                                </Select>
                            </div>
                            <Input addonBefore={`/${this.props.pro.projectCode}`}
                                   placeholder={"请输入请求路径"}
                                   value={this.state.url} onChange={(e) => this.setURL(e)}/>
                            <Input placeholder={"请输入接口描述"} className="url-input" value={this.state.description}
                                   onChange={(e) => this.setDesc(e)}/>
                        </div>
                        <div className="api-tab-area">
                            <Tabs style={{marginTop: 9}} defaultActiveKey="param">
                                <TabPane tab="编辑输入参数" key="param">
                                    <ParamTable key="addParam" title="参数配置表" dataSource={this.state.addTableParam}
                                                onOk={(value) => this.onOk(value, '', 'addTableParam')}/>
                                </TabPane>
                                <TabPane tab="编辑输出参数" key="json">
                                    <ParamTable key="addJson" title="Json配置表" dataSource={this.state.addTableJson}
                                                onOk={(value) => this.onOk(value, 'json', 'addTableJson')}
                                                toString={() => this.stringifyJSON('add', this.state.json)}
                                                format={() => this.formatAndCheckJSON('add', this.state.json, true)}
                                                toTable={() => this.formatAndCheckJSON('add', this.state.json, false)}
                                    />
                                    <Input value={this.state.json} style={{marginTop: 9}} placeholder="可通过上面的表格进行文档编辑或通过该文本输入，再导入表格"
                                           autosize={{minRows: 5, maxRows: 15}} type="textarea"
                                           onChange={(e) => this.setJSON(e)}/>
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                </Modal>
                <Modal
                    visible={this.state.editModalVisible}
                    title={this.state.api ? this.state.api.url : null}
                    maskClosable={false}
                    width={1280}
                    onOk={() => this.closeEditModal(true)}
                    onCancel={() => this.closeEditModal(false)}>
                    <div>
                        <div className="api-input-area">
                            <div style={{marginBottom: 15}}>
                                <span>接口模块</span>
                                <Select style={{width: 250, marginLeft: 21}} value={this.state.editModule}
                                        onChange={this.setEditModule}>
                                    {
                                        this.props.module.map(item => {
                                            return (<Option key={item._id}>{item.moduleName}</Option>)
                                        })
                                    }
                                </Select>
                            </div>
                            <div style={{marginBottom: 15}}>
                                <span>请求类型</span>
                                <Select style={{width: 250, marginLeft: 21}} value={this.state.editMethod}
                                        onChange={this.setEditMethod}>
                                    <Option value="GET">GET</Option>
                                    <Option value="POST">POST</Option>
                                </Select>
                            </div>
                            <Input addonBefore={`/${this.props.pro.projectCode}`} placeholder="请输入请求路径"
                                   value={this.state.editUrl} onChange={(e) => this.setEditURL(e)}/>
                            <Input placeholder={"请输入接口描述"} className="url-input" value={this.state.editDescription}
                                   onChange={(e) => this.setEditDesc(e)}/>
                        </div>
                        <div className="api-tab-area">
                            <Tabs style={{marginTop: 20}} defaultActiveKey="editParam">
                                <TabPane tab="修改输入参数" key="editParam">
                                    <ParamTable key="editParam" title="参数配置表" dataSource={this.state.editTableParam}
                                                onOk={(value) => this.onOk(value, '', 'editTableParam')}/>
                                </TabPane>
                                <TabPane tab="修改输出参数" key="editJson">
                                    <ParamTable key="editJson" title="Json配置表" dataSource={this.state.editTableJson}
                                                onOk={(value) => this.onOk(value, 'editJson', 'editTableJson')}
                                                toString={() => this.stringifyJSON('edit', this.state.editJson)}
                                                format={() => this.formatAndCheckJSON('edit', this.state.editJson, true)}
                                                toTable={() => this.formatAndCheckJSON('edit', this.state.editJson, false)}
                                    />
                                    <Input value={this.state.editJson} style={{marginTop: 9}}
                                           autosize={{minRows: 5, maxRows: 15}}
                                           type="textarea" onChange={(e) => this.setEditJSON(e)}/>
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                </Modal>
                <Modal
                    visible={this.state.rollBackVisible}
                    title="历史记录"
                    maskClosable={false}
                    footer={[<Button key="closeApiManage" onClick={this.closeRollBack}>关闭</Button>]}
                >
                    <div>
                        <Table
                            columns={this.rollbackColumns}
                            dataSource={this.state.apiHis}
                            pagination={false}
                            scroll={{y: 600}}
                        />
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
            </section>
        )
    }

}

export default ApiManage;