/**
 * Created by therfaint- on 01/08/2017.
 */
import fetch from '../../util/fetch';

import React from 'react';
import Message from 'antd/lib/message';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
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

import JsonFormatter from '../../util/JSON_Format'

import ParamTable from './editable_param_table';

import dataParser from '../../util/Data_Parser';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

const { TextArea } = Input;

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
            title: '接口描述',
            key: 'url',
            dataIndex: 'description',
            width: 300,
            render: (text, record, index) => (
                <span>{record.description && record.hasOwnProperty('method') ? record.description : ''}</span>
            )
        },
            {
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
                                <Button icon="delete" className="op-btn"
                                        onClick={() => this.deleteAPI(record)}>删除</Button>
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

            searchParam: '',
            searchPro: '',

            api: null,
            apis: null,

            module: this.props.rootId,
            editModule: '',

            url: '',
            method: 'GET',
            contentType: 'multipart/form-data',
            description: '',
            param: null,
            json: null,

            editUrl: '',
            editMethod: '',
            editContentType: '',
            editDescription: '',
            editParam: null,
            editJson: null,

            // documentVisible: false,
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

            apiHis: [],

            status: 'add',

            addActive: 'param',
            editActive: 'editParam'
        };
    }

    // 通过接口id数组导入
    importApiById = () => {
        let url = '/importAPIs.json';
        let data = {
            proId: this.state.pageId,
            apiArr: this.state.value,
            proCode: this.props.pro.projectCode,
            moduleId: this.state.importTargetModule
        };
        fetch(url, data).then(data => {
            if (data.success) {
                Message.success('导入成功');
                this.getAllAPIByProId();
                this.getAllPros();
                this.getAllAPI();
            } else {
                Message.error(data.msg)
            }
        })
    };

    // 获取全部用于导入的API
    getAllAPI = () => {
        let url = '/getAllApi.json';
        fetch(url).then(data => {
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
        })
    };

    // 获取全部项目信息
    getAllPros = () => {
        let url = '/getAllPro.json';
        fetch(url).then(data => {
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
        })
    };

    // 获取全部项目信息
    getAllModules = () => {
        let url = '/getAllModule.json';
        fetch(url).then(data => {
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
        let url = '/getHisById.json?id=' + record._id;
        fetch(url).then(data => {
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
        })
    };

    // 新增API
    saveAPI = () => {
        let url = '/saveApi.json';
        let data = {
            paramTable: JSON.stringify(this.state.addTableParam),
            jsonTable: JSON.stringify(this.state.addTableJson),
            method: this.state.method,
            contentType: this.state.contentType,
            createTime: moment().format(dateFormat),
            json: JF.toJsonStr(this.state.json),
            description: this.state.description,
            moduleId: this.state.module,
            proId: this.state.pageId,
            proCode: this.props.pro.projectCode
        };
        if (!data.json) {
            Message.error('输入框中JSON格式异常!!!');
            return;
        }
        if (this.state.method === 'GET') {
            // 校验GET请求URL和JSON参数格式
            data.url = this.state.url;
        } else {
            // 校验POST请求和参数以及JSON参数格式
            data.url = this.state.url;
            data.param = JF.toJsonStr(this.state.param);
        }
        fetch(url, data).then(data => {
            if (data.success) {
                Message.success('创建成功');
            } else {
                Message.error(data.msg.message)
            }
            this.hideModal();
            this.getAllAPIByProId();
        })
    };

    // 删除API
    deleteAPI = (record) => {
        Modal.confirm({
            content: '确认删除？',
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                let url = '/deleteApi.json';
                let data = {
                    id: record._id,
                    proId: this.state.pageId,
                    lastUpdateTime: moment().format(dateFormat)
                };
                fetch(url, data).then(data => {
                    if (data.success) {
                        Message.success('删除成功');
                    } else {
                        Message.error(data.msg)
                    }
                    this.getAllAPIByProId();
                })
            }
        });
    };

    // 编辑API
    updateAPI = () => {
        let url = '/updateApi.json';
        let data = {
            proCode: this.props.pro.projectCode,
            paramTable: JSON.stringify(this.state.editTableParam),
            jsonTable: JSON.stringify(this.state.editTableJson),
            id: this.state.api._id,
            url: this.state.editUrl,
            method: this.state.editMethod,
            contentType: this.state.editContentType,
            json: JF.toJsonStr(this.state.editJson),
            description: this.state.editDescription,
            moduleId: this.state.editModule,
            proId: this.state.pageId,
            lastUpdateTime: moment().format(dateFormat)
        };
        if (!data.json) {
            Message.error('输入框中JSON格式异常!!!');
            return;
        }
        fetch(url, data).then(data => {
            if (data.success) {
                Message.success('编辑成功');
            } else {
                Message.error(data.msg)
            }
            this.hideModal();
            this.getAllAPIByProId();
        })
    };

    // todo回滚单条接口
    rollbackApi = (record) => {
        let url = '/hisRollback.json';
        let data = {
            id: record.refApiId,
            param: record.api
        };
        fetch(url, data).then(data => {
            if (data.success) {
                Message.success('接口回滚成功');
                this.setState({
                    rollBackVisible: false
                })
            } else {
                Message.error(data.msg);
            }
            this.getAllAPIByProId();
        })
    };

    // 获取全部模块
    getAllModuleByProId = (map) => {
        let url = '/getAllModuleById.json?proId=' + this.props.pro._id;
        fetch(url).then(data => {
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
        })
    };

    // 获取全部API
    getAllAPIByProId = () => {
        let url = '/getAllApiById.json?proId=' + this.props.pro._id;
        fetch(url).then(data => {
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
        let url = '/queryByParam.json';
        let data = {
            proCode: this.props.pro.projectCode,
            url: e.target.value
        };
        fetch(url, data).then(data => {
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
        })
    };

    // 显示新增API Modal
    showAddModal = () => {
        this.emptyModal();
        this.showModal();
        this.setState({
            status: 'add'
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
        if (bool && !this.isInvalidTableDS(this.state.addTableParam, 'param')) {
            Message.error('请完整填写输入参数表格');
            this.onTabChange('add', 'param');
            return;
        }
        if (bool && !this.isInvalidTableDS(this.state.addTableJson, 'json')) {
            Message.error('请完整填写输出参数表格');
            this.onTabChange('add', 'json');
            return;
        }
        if (bool) {
            this.saveAPI();
        } else {
            this.hideModal();
        }
    };

    // 显示编辑API Modal
    showEditModal = (record) => {
        this.showModal();
        let editTableParam, editJson, editTableJson;
        editTableParam = (record.paramTable ? JSON.parse(record.paramTable) : null);
        editJson = JF.toJsonObj(JSON.parse(record.json));
        editTableJson = (record.jsonTable ? JSON.parse(record.jsonTable) : null);
        this.setState({
            editModule: record.refModuleId,
            api: record,
            editUrl: record.url,
            editMethod: record.method,
            editContentType: record.contentType,
            editTableParam,
            editJson,
            editTableJson,
            editDescription: record.description,
            status: 'edit'
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
        if (bool && !this.isInvalidTableDS(this.state.editTableParam, 'param')) {
            Message.error('请完整填写输入参数表格');
            this.onTabChange('edit', 'editParam');
            return;
        }
        if (bool && !this.isInvalidTableDS(this.state.editTableJson, 'json')) {
            Message.error('请完整填写输出参数表格');
            this.onTabChange('edit', 'editJson');
            return;
        }
        if (bool) {
            this.updateAPI();
        } else {
            this.hideModal();
        }
    };

    // 清空新增/编辑Modal
    emptyModal = () => {
        this.setState({
            module: this.props.rootId,
            url: '',
            method: 'GET',
            contentType: 'multipart/form-data',
            description: '',
            addTableParam: null,
            json: '',
            addTableJson: null
        })
    };

    setInput = (key, e) => {
        let state = {};
        state[key] = e.target.value;
        this.setState(state);
    };

    setSelect = (key, val) => {
        let state = {};
        state[key] = val;
        this.setState(state);
    };

    // 设置JSON返回
    setJSON = (e) => {
        this.setState({
            json: e.target.value,
            addTableJson: JF.updateJsonToTable(e.target.value, this.state.addTableJson)
        });
    };

    setTargetModule = (value) => {
        this.setState({
            importTargetModule: value
        })
    };

    // 编辑JSON返回
    setEditJSON = (e, bool) => {
        if(bool){
            this.setState({
                editJson: JF.toJsonObj(e),
                editTableJson: JF.updateJsonToTable(JSON.stringify(e), this.state.editTableJson)
            });
        }else{
            this.setState({
                editJson: e.target.value,
                editTableJson: JF.updateJsonToTable(e.target.value, this.state.editTableJson)
            });
        }
    };

    // 格式化JSON输入=>对象格式(实质:在字符串加上/n/t等)
    formatAndCheckJSON = (type, data, bool) => {
        let result, table, state = {};
        if (!data && bool) {
            Message.warn('格式化内容不能为空');
            return;
        } else if (!data && !bool) {
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
            result = JF.diffInputType(data, 'json');
            if (!result) {
                Message.error('解析失败 请校验输入格式是否正确');
                return;
            }
            if (type === 'add' && !bool) {
                table = JF.updateJsonToTable(result, this.state.addTableJson)
            } else {
                table = JF.updateJsonToTable(result, this.state.editTableJson)
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
                    param: result,
                });
                break;
            case 'editParam':
                this.setState({
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
            return (ts.url && ts.method && ts.description && ts.module && ts.addTableJson);
        } else if (type === 'edit') {
            return (ts.editUrl && ts.editMethod && ts.editTableJson && ts.editDescription && ts.editModule);
        }
    };

    // 保存编辑框
    onOk = (value, tar, table) => {
        let state = {};
        let isArray = DP.isArray(value);
        if (tar) {
            state[tar] = JF.toJsonObj(DP.dataSourceFill(value));
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

    componentWillMount = () => {
        this.setState({pageId: this.props.pro._id, module: this.props.rootId});
        this.getAllAPI();
        this.getAllPros();
        this.getAllModules();
        this.getAllAPIByProId();
    };

    componentDidMount = () => {
        this.refs.modal.style.display = 'none';
        // TW情况下进行更新
        // if(location.href.indexOf('5b7e82f8e43e364985f7c27d') !== -1){
        //     const socket = io.connect('http://10.57.17.239:8088');
        //     socket.on('update', (data) => {
        //         this.setEditJSON(data, true);
        //     })
        // }
    };

    onChange = (value) => {
        this.setState({value});
    };

    isInvalidTableDS = (table, type) => {
        let status = true;
        if (!table && type === 'param') {
            return status
        } else {
            table.map(item => {
                if (!item.paramName) {
                    status = false;
                }
                if (!item.paramType.length) {
                    status = false;
                }
                if (item.hasOwnProperty('children')) {
                    this.isInvalidTableDS(item.children);
                }
            });
            return status;
        }
    };

    componentWillReceiveProps = (nextProps, nextState) => {
        this.getAllAPIByProId();
        if (!nextProps.editable) {
            this.refs.modal.style.display = 'none';
        }
    };

    showModal = () => {
        this.refs.modal.style.display = 'flex';
        this.refs.modal.classList.add('fade_in');
    };

    hideModal = () => {
        this.refs.modal.classList.remove('fade_in');
        this.refs.modal.classList.add('fade_out');
        setTimeout(() => {
            this.refs.modal.classList.remove('fade_out');
            this.refs.modal.style.display = 'none';
        }, 800)
    };

    clearInput = () => {
        this.setState({searchParam: ''});
        this.getAllAPIByProId();
    };

    onTabChange = (type, key) => {
        let state = {};
        if (key) {
            if (type === 'add') {
                state['addActive'] = key;
            } else {
                state['editActive'] = key;
            }
        } else {
            if (type === 'add') {
                state['addActive'] = this.state.addActive === 'param' ? 'json' : 'param';
            } else {
                state['editActive'] = this.state.editActive === 'editParam' ? 'editJson' : 'editParam';
            }
        }
        this.setState(() => {
            return state
        });
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

        return (
            <section id="container">
                {
                    this.state.status === 'add' ?
                        <section ref="modal" className={`api-edit-area`}>
                            <div className="api-tab-area">
                                <Tabs style={{marginTop: 9}} activeKey={this.state.addActive}
                                      onChange={(k) => this.onTabChange('add', k)}>
                                    <TabPane tab="输入参数" key="param">
                                        <ParamTable type="param" key="addParam" title="参数配置表"
                                                    dataSource={this.state.addTableParam}
                                                    onOk={(value) => this.onOk(value, '', 'addTableParam')}/>
                                    </TabPane>
                                    <TabPane tab="输出参数" key="json">
                                        <ParamTable type="json" key="addJson" title="Json配置表"
                                                    dataSource={this.state.addTableJson}
                                                    onOk={(value) => this.onOk(value, 'json', 'addTableJson')}
                                                    toString={() => this.stringifyJSON('add', this.state.json)}
                                                    format={() => this.formatAndCheckJSON('add', this.state.json, true)}
                                                    toTable={() => this.formatAndCheckJSON('add', this.state.json, false)}
                                        />
                                        <TextArea value={this.state.json} style={{marginTop: 9}}
                                               placeholder="通过上面的表格进行文档编辑/通过文本输入JSON格式数据后导入表格"
                                               autosize={{minRows: 5, maxRows: 15}} type="textarea"
                                               onChange={(e) => this.setJSON(e)}/>
                                    </TabPane>
                                </Tabs>
                            </div>
                            <div className="wrapper">
                                <div className="api-form-area">
                                    <div className="api-title">创建接口</div>
                                    <div className="api-input-area">
                                        <div className="form-item">
                                            <div>接口模块</div>
                                            <div>
                                                <Select style={{width: '100%'}} value={this.state.module}
                                                        onChange={(val) => this.setSelect('module', val)}>
                                                    {
                                                        this.props.module.map(item => {
                                                            return (<Option key={item._id}>{item.moduleName}</Option>)
                                                        })
                                                    }
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="form-item">
                                            <div>请求类型</div>
                                            <div>
                                                <Select style={{width: '100%'}} value={this.state.method}
                                                        onChange={(val) => this.setSelect('method', val)}>
                                                    <Option value="GET">GET</Option>
                                                    <Option value="POST">POST</Option>
                                                    <Option value="PUT">PUT</Option>
                                                    <Option value="PATCH">PATCH</Option>
                                                    <Option value="DELETE">DELETE</Option>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="form-item">
                                            <div>Content-Type</div>
                                            <div>
                                                <Select style={{width: '100%'}} value={this.state.contentType}
                                                        onChange={(val) => this.setSelect('contentType', val)}>
                                                    <Option value="multipart/form-data">multipart/form-data</Option>
                                                    <Option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</Option>
                                                    <Option value="application/json">application/json</Option>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="form-item">
                                            <div>请求URL</div>
                                            <Input addonBefore={`/${this.props.pro.projectCode}`}
                                                   placeholder={"请输入请求路径"}
                                                   value={this.state.url} onChange={(e) => this.setInput('url', e)}/>
                                        </div>
                                        <div className="form-item">
                                            <div>接口描述</div>
                                            <Input placeholder={"请输入接口描述"} value={this.state.description}
                                                   onChange={(e) => this.setInput('description', e)}/>
                                        </div>
                                        <div className="form-item">
                                            <Button style={{width: '100%'}} type="primary"
                                                    onClick={() => this.closeAddModal(true)}>创建</Button>
                                        </div>
                                    </div>
                                    <div className="api-switch">
                                        <span onClick={() => this.onTabChange('add')}>切换</span>
                                        <span onClick={() => this.closeAddModal(false)}>关闭</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                        :
                        <section ref="modal" className={`api-edit-area`}>
                            <div className="api-tab-area">
                                <Tabs style={{marginTop: 20}} activeKey={this.state.editActive}
                                      onChange={(k) => this.onTabChange('edit', k)}>
                                    <TabPane tab="输入参数" key="editParam">
                                        <ParamTable type="param" key="editParam" title="参数配置表"
                                                    dataSource={this.state.editTableParam}
                                                    onOk={(value) => this.onOk(value, '', 'editTableParam')}/>
                                    </TabPane>
                                    <TabPane tab="输出参数" key="editJson">
                                        <ParamTable type="json" key="editJson" title="Json配置表"
                                                    dataSource={this.state.editTableJson}
                                                    onOk={(value) => this.onOk(value, 'editJson', 'editTableJson')}
                                                    toString={() => this.stringifyJSON('edit', this.state.editJson)}
                                                    format={() => this.formatAndCheckJSON('edit', this.state.editJson, true)}
                                                    toTable={() => this.formatAndCheckJSON('edit', this.state.editJson, false)}
                                        />
                                        <TextArea value={this.state.editJson} style={{marginTop: 9}}
                                               autosize={{minRows: 5, maxRows: 15}}
                                               type="textarea" onChange={(e) => this.setEditJSON(e)}/>
                                    </TabPane>
                                </Tabs>
                            </div>
                            <div className="wrapper">
                                <div className="api-form-area">
                                    <div className="api-title">更新接口</div>
                                    <div className="api-input-area">
                                        <div className="form-item">
                                            <div>接口模块</div>
                                            <div>
                                                <Select style={{width: '100%'}} value={this.state.editModule}
                                                        onChange={(val) => this.setSelect('editModule', val)}>
                                                    {
                                                        this.props.module.map(item => {
                                                            return (<Option key={item._id}>{item.moduleName}</Option>)
                                                        })
                                                    }
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="form-item">
                                            <div>请求类型</div>
                                            <div>
                                                <Select style={{width: '100%'}} value={this.state.editMethod}
                                                        onChange={(val) => this.setSelect('editMethod', val)}>
                                                    <Option value="GET">GET</Option>
                                                    <Option value="POST">POST</Option>
                                                    <Option value="PUT">PUT</Option>
                                                    <Option value="PATCH">PATCH</Option>
                                                    <Option value="DELETE">DELETE</Option>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="form-item">
                                            <div>Content-Type</div>
                                            <div>
                                                <Select style={{width: '100%'}} value={this.state.editContentType}
                                                        onChange={(val) => this.setSelect('editContentType', val)}>
                                                    <Option value="multipart/form-data">multipart/form-data</Option>
                                                    <Option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</Option>
                                                    <Option value="application/json">application/json</Option>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="form-item">
                                            <div>请求URL</div>
                                            <Input addonBefore={`/${this.props.pro.projectCode}`} placeholder="请输入请求路径"
                                                   value={this.state.editUrl}
                                                   onChange={(e) => this.setInput('editUrl', e)}/>
                                        </div>
                                        <div className="form-item">
                                            <div>接口描述</div>
                                            <Input placeholder={"请输入接口描述"} value={this.state.editDescription}
                                                   onChange={(e) => this.setInput('editDescription', e)}/>
                                        </div>
                                        <div className="form-item">
                                            <Button style={{width: '100%'}} type="primary"
                                                    onClick={() => this.closeEditModal(true)}>更新</Button>
                                        </div>
                                    </div>
                                    <div className="api-switch">
                                        <span onClick={() => this.onTabChange('edit')}>切换</span>
                                        <span onClick={() => this.closeEditModal(false)}>关闭</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                }
                <div className="title">
                    <span style={{fontSize: 20, fontWeight: 'bold'}}>接口配置</span>
                    <Icon style={{fontSize: 18, marginLeft: 9, cursor: 'pointer'}} type="plus-circle-o"
                          onClick={() => this.showAddModal()}/>
                    <div style={{position: 'absolute', top: 3, left: 166}}>
                        <Input placeholder="请输入请求路径" style={{width: 250, marginLeft: 9}}
                               value={this.state.searchParam}
                               onChange={this.getAPIByParam} suffix={ this.state.searchParam ?
                            <Icon type="close-circle" className="clear-input" onClick={this.clearInput}/> : null}/>
                    </div>
                    <div className="header-btns">
                        <span className="header-btn" onClick={this.showEditProject}>
                            <Icon type="setting"/>接口导入
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