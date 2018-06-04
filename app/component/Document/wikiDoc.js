/**
 * Created by therfaint- on 30/10/2017.
 */
import fetch from '../../util/fetch';

import React from 'react';
import {Link} from "react-router-dom";
import Message from 'antd/lib/message';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Notification from 'antd/lib/notification';
import ApiManage from '../ApiManage/apiManage';
import ModuleManage from './moduleManage';
import Loading from '../ApiTest/loading';
import DragPanel from '../ApiTest/dragableTabPanel';

import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

import JsonFormatter from '../../util/JSON_Format';

import InterfaceIns from './interfaceIns';

import Nav from './catalog';

Message.config({
    duration: 5,
});

Notification.config({
    duration: 9,
});

const JF = new JsonFormatter();

class WikiDoc extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pro: {}, // 项目对象
            module: [], // 模块数组
            apis: [], // 接口数组

            catalogDS: [], // 目录数据结构

            rootId: '',

            editPanelVisible: false,
            moduleManageVisible: false,
            sendVisible: false,

            pageId: undefined, // 当前项目ID

            scroll: false,

            url: '', // 测试URL
            cookie: '', // 测试cookie

            paramArr: [], // 测试数据集合

            bgWidth: 0,
            bgHeight: 0,
            isSend: false
        };
        this.offsetTop = 0;
        this.firstRender = true;
    };

    handleTableDS = (arr, indent, type, arrName) => {
        let retDS = [];
        if (arr && arr.length) {
            arr.map(item => {
                let obj = {}, isArr;
                // todo 考虑将array和object的字段进行修饰
                if (type) {
                    obj['paramName'] = arrName + '[i]';
                } else {
                    obj['paramName'] = item.paramName;
                }
                obj['illustration'] = item.illustration;
                obj['usrDefine'] = item.usrDefine;
                obj['indent'] = indent;
                if (item.hasOwnProperty('paramType')) {
                    obj['paramType'] = this.dataTypeFormatter(item.paramType);
                    if (obj['paramType'] === 'Array') {
                        isArr = true;
                        if (item.children.length) {

                        }
                        obj['paramType'] = this.dataTypeFormatter(item.children.length ? item.children[0].paramType : ['Error']) + '[]';
                    }
                }
                retDS.push(obj);
                if (item.hasOwnProperty('children')) {
                    retDS = retDS.concat(this.handleTableDS(item.children, indent + 1, isArr, obj['paramName']));
                }
            })
        }
        return retDS;
    };

    dataTypeFormatter = (d) => {
        let data = d.join(',').toLowerCase();
        switch (true) {
            case data.indexOf('string') !== -1:
                return 'String';
            case data.indexOf('number') !== -1:
                return 'Number';
            case data.indexOf('boolean') !== -1:
                return 'Boolean';
            case data.indexOf('array') !== -1:
                return 'Array';
            case data.indexOf('object') !== -1:
                return 'Object';
            case data.indexOf('error') !== -1:
                return '未定义';
            default:
                return '错误类型';
        }
    };

    // 格式化
    formatCatalogData = (treeDS, parentIndex) => {
        // 先序遍历
        let retDS = [], count = 1;
        if (treeDS && treeDS.length) {
            treeDS.map(item => {
                let obj = {...item};
                if (parentIndex) {
                    obj['order'] = parentIndex + '.' + count;
                } else {
                    obj['order'] = String(count);
                }
                obj['type'] = item.type;
                obj['key'] = item.key;
                if (item.hasOwnProperty('children') || parentIndex) {
                    retDS.push(obj);
                    retDS = retDS.concat(this.formatCatalogData(item['children'], count));
                    count++;
                }
            })
        }
        return retDS;
    };

    formatWikiDocData = (data, isArray) => {
        if (isArray) {
            let res = [...data],
                jsonTable,
                paramTable;
            res.map((item, index) => {
                let arr = item.url.split('/');
                arr.splice(0, 2);
                item.url = '/' + arr.join('/');
                item.key = item._id;
                item.index = index;
                try {
                    jsonTable = JSON.parse(item.jsonTable);
                } catch (e) {
                    jsonTable = [];
                } finally {
                    item.testTable = jsonTable;
                    item.jsonTable = this.handleTableDS(jsonTable, 1);
                }
                try {
                    paramTable = JSON.parse(item.paramTable);
                } catch (e) {
                    paramTable = [];
                } finally {
                    item.paramTable = this.handleTableDS(paramTable, 1);
                }
                try {
                    item.json = JF.isString(item.json) ? item.json : (JSON.parse(item.json) instanceof Array ? JF.toJsonObj(JSON.parse(item.json), 1, true) : (JSON.parse(item.json) instanceof Object ? JF.toJsonObj(JSON.parse(item.json), 1, false) : null));
                } catch (e) {
                    item.json = '{/n/n}';
                }
            });
            return res;
        } else {
            let res = {...data},
                jsonTable,
                paramTable;
            let arr = res.url.split('/');
            arr.splice(0, 2);
            res.url = '/' + arr.join('/');
            res.key = res._id;
            try {
                jsonTable = JSON.parse(res.jsonTable);
            } catch (e) {
                jsonTable = [];
            } finally {
                res.jsonTable = this.handleTableDS(jsonTable, 1);
            }
            try {
                paramTable = JSON.parse(res.paramTable);
            } catch (e) {
                paramTable = [];
            } finally {
                res.paramTable = this.handleTableDS(paramTable, 1);
            }
            try {
                res.json = JF.isString(res.json) ? res.json : (JSON.parse(res.json) instanceof Array ? JF.toJsonObj(JSON.parse(res.json), 1, true) : (JSON.parse(res.json) instanceof Object ? JF.toJsonObj(JSON.parse(res.json), 1, false) : null));
            } catch (e) {
                res.json = '{/n/n}';
            }
            return res;
        }
    };

    // 根据项目ID获取其下API
    getAPIsById = () => {
        let url = '/getAllApiById.json?proId=' + this.state.pageId;
        fetch(url).then(data => {
            if (data.success) {
                let res = JSON.parse(JSON.stringify(data));
                this.setState({
                    paramArr: res.result
                });
                let mapObj = {};
                if (data.result && data.result.length) {
                    data.result.map(item => {
                        item['type'] = 2;
                        if (!mapObj.hasOwnProperty(item.refModuleId)) {
                            mapObj[item.refModuleId] = [];
                        }
                        mapObj[item.refModuleId].push(this.formatWikiDocData(item, false));
                    });
                }
                this.getAllModuleByProId(mapObj, data.result);
            } else {
                Message.error(data.msg)
            }
        })
    };

    getProById = () => {
        let url = '/getProById.json?id=' + this.state.pageId;
        fetch(url).then(data => {
            if (data.success) {
                this.setState({
                    pro: data.result
                })
            } else {
                Message.error(data.msg)
            }
        })
    };

    // send = async (host, param, cookie, jsonTable) => {
    //     let length = param.length;
    //     for (let i = 0; i < length; i++) {
    //         let startTime = new Date();
    //         let endTime = '';
    //         try {
    //             await fetch('/apiTest', {
    //                 param: param[i],
    //                 host,
    //                 cookie
    //             }).then(res => {
    //                 endTime = new Date();
    //                 this.isValidReturns(jsonTable[i], res, i);
    //                 if (res.code === 200) {
    //                     param[i]['result'] = res.result;
    //                     param[i]['duration'] = endTime.getTime() - startTime.getTime();
    //                     console.log(param[i])
    //                 } else if (res.code === 500) {
    //                     Message('请求超时 请重试');
    //                     throw new Error();
    //                 }
    //             }).catch(e => {
    //                 console.log(e);
    //             });
    //         } catch (e) {
    //             console.log(e)
    //         }
    //         if (i === length - 1) {
    //             this.setState({
    //                 isSend: false
    //             });
    //             this.refs.mask.style.display = 'none';
    //         }
    //     }
    // };
    //
    // // 测试单一接口
    // isConnectable = (host, param, cookie) => {
    //     let p = [...param];
    //     let jsonTable = [];
    //     p.map(item => {
    //         jsonTable.push(item.jsonTable);
    //     });
    //     fetch('/ping', {
    //         host,
    //         param: p[0],
    //         cookie
    //     }).then(res => {
    //         if (res.code === 1) {
    //             this.send(host, param, cookie, jsonTable);
    //         } else {
    //             Message.error('该URL无法ping通 请检查URL和cookie是否正确');
    //             this.setState({
    //                 isSend: false
    //             });
    //             this.refs.mask.style.display = 'none';
    //         }
    //     });
    //
    // };

    // 获取全部模块
    getAllModuleByProId = (mapObj, apis) => {
        let url = '/getAllModuleById.json?proId=' + this.state.pageId;
        fetch(url).then(data => {
            if (data.success) {
                let rootId = '', count = 0, isRoot = false;
                let catalogDS = [...data.result], retDS = [];
                data.result.map(item => {
                    item.key = item._id;
                    if (item.moduleName === '系统目录') {
                        rootId = item._id;
                    }
                });
                for (let k in mapObj) {
                    if (mapObj[k] && mapObj[k].length) {
                        count++;
                        if (k === rootId) {
                            isRoot = true;
                        }
                    }
                }
                if (count !== 1 || !isRoot) {
                    if (data.result.length > 1) {
                        catalogDS.map(item => {
                            item['type'] = 1;
                            if (mapObj[item['_id']]) {
                                item['children'] = mapObj[item['_id']];
                            }
                        });
                        retDS = this.formatCatalogData(catalogDS);
                        this.setState({
                            catalogDS: retDS
                        });
                    }
                } else {
                    this.setState({
                        apis: this.formatWikiDocData(apis, true)
                    })
                }
                this.setState({
                    module: data.result,
                    rootId
                })
            } else {
                Message.error(data.msg)
            }
        })
    };

    // 回到顶部
    scrollTop = () => {
        window.scrollTo(0, 0);
    };

    // 复制链接
    copyUrl = (e, type) => {
        if (type === 'api') {
            this.refs['copy_panel'].value = `${window.location.protocol}//${window.location.host}/${this.state.pro.projectCode}${e.target.innerText}`;
        } else {
            let url = window.location.href, hash = window.location.hash, href;
            if (hash) {
                href = url.split(hash)[0];
            } else {
                href = url;
            }
            this.refs['copy_panel'].value = href;
        }
        this.refs['copy_panel'].select();
        document.execCommand("copy");
        Message.success(type === 'api' ? '请求接口链接已复制' : '接口文档链接已复制');
    };

    showAPIManageModal = () => {
        this.setState({editPanelVisible: true});
    };

    showModuleManageModal = () => {
        this.setState({moduleManageVisible: true});
    };

    showSendModal = () => {
        this.setState({sendVisible: true});
    };

    hideSendModal = () => {
        this.setState({sendVisible: false});
    };

    // API管理组件
    hideAPIManageModal = () => {
        this.getAPIsById();
        this.setState({editPanelVisible: false});
    };

    hideModuleManageModal = () => {
        this.getAPIsById();
        this.setState({moduleManageVisible: false});
    };

    componentWillMount = () => {
        let url = window.location.href, hash = window.location.hash, href, pageId;
        if (hash) {
            href = url.split(hash)[0];
        } else {
            href = url;
        }
        pageId = href.split('pageId=')[1];
        this.setState({pageId});
    };

    componentDidMount = () => {
        this.refs.modal.style.display = 'none';
        // this.testSingleApi();
        this.getProById();
        this.getAPIsById();
        window.onscroll = (e) => {
            let state = {};
            if (window.scrollY > this.offsetTop) {

            } else {

            }
            if (window.scrollY > this.catalog.offsetTop + this.catalog.clientHeight) {
                state['scroll'] = true;
            } else {
                state['scroll'] = false;
            }
            this.setState(state);
        };
    };

    componentDidUpdate = () => {
        let href = window.location.href;
        if(href.indexOf('#') !== -1){
            let id = href.split('#')[1];
            if(document.getElementById(id) && this.firstRender){
                let offsetTop = document.getElementById(id).offsetTop;
                window.document.documentElement.scrollTop = offsetTop;
                this.firstRender = false;
            }
        }
    };

    componentWillUnmount = () => {
        window.onscroll = null;
    };

    startTestApi = () => {
        let mask = this.refs.mask;
        let host = this.state.url;
        let param = this.state.paramArr;
        let cookie = this.state.cookie;
        if (this.state.isSend) {
            return;
        }
        if (this.state.cookie && this.state.url) {
            mask.style.display = 'block';
            this.setState({
                isSend: true
            });
            this.isConnectable(host, param, cookie);
        } else {
            Message.info('请输入请求URL及cookie信息')
        }
    };

    showModal = () => {
        // this.formatParams();
        // document.body.style.overflow = 'hidden';
        // this.refs.modal.style.display = 'flex';
        // this.refs.modal.classList.add('fade_in');
    };

    hideModal = () => {
        document.body.style.overflow = 'scroll';
        this.refs.modal.classList.remove('fade_in');
        this.refs.modal.classList.add('fade_out');
        setTimeout(() => {
            this.refs.modal.classList.remove('fade_out');
            this.refs.modal.style.display = 'none';
        }, 800)
    };

    setInput = (key, e) => {
        let state = {};
        state[key] = e.target.value;
        this.setState(state);
    };

    formatParams = () => {
        let paramArr = [];
        this.state.paramArr.map((item, index) => {
            paramArr.push(this.formatParam(item, index));
        });
        this.setState({
            paramArr
        })
    };

    formatParam = (api, index) => {
        let formatParam = {};
        let paramObj;
        let arr = api.url.split('/');
        try {
            formatParam['jsonTable'] = JSON.parse(api.jsonTable);
            paramObj = JSON.parse(api.paramTable);
        } catch (e) {
            formatParam['jsonTable'] = [];
            paramObj = [];
        }
        arr.splice(0, 2);
        formatParam['url'] = '/' + arr.join('/');
        formatParam['description'] = api.description;
        formatParam['index'] = index;
        formatParam['method'] = api.method;
        formatParam['params'] = {};
        paramObj.map(p => {
            if (p.usrDefine.indexOf(',') !== -1) {
                formatParam['params'][p.paramName] = p.usrDefine.split(',');
            } else {
                formatParam['params'][p.paramName] = p.usrDefine;
            }
        });
        return formatParam;
    };

    showChild = (e) => {
        let tar = e.currentTarget;
        if (e.target.classList.contains('dl-up') || e.target.classList.contains('dl-down') || e.target.parentNode.classList.contains('api-test-detail') || e.target.classList.contains('api-test-detail')) {
            return;
        }
        if (tar.lastChild.classList.contains('show')) {
            tar.lastChild.classList.remove('show')
        } else {
            tar.lastChild.classList.add('show')
        }
    };

    changeStatus = () => {
        if (this.state.sort) {
            this.setState({
                sort: false
            })
        } else {
            this.setState({
                sort: true
            })
        }
    };

    countKeys = (obj) => {
        let count = 0;
        for (let k in obj) {
            count++;
        }
        return count;
    };

    isValidReturn = (jsonTable, result) => {
        let state = true;
        let paramNameArr = [], op = 'eq';
        let retLength = this.countKeys(result);// 1.返回字段数目不同 则判断 缺少 或 多余 2.数目相同判断内层结构是否相同
        // 定义一个状态 默认为true 只要失败置为false
        // 1.遍历json结构 2.如果有子元素则递归 3.没有的话则直接判断
        if (retLength > jsonTable.length) {
            jsonTable.map(item => {
                for (let k in result) {
                    if (k === item['paramName'] || item['paramName'] === 'THIS_iS_ARRAY_TYPE') {
                        if (item.hasOwnProperty('children') || (item['paramName'] === 'THIS_iS_ARRAY_TYPE' && (item['paramType'][0] === 'object' || item['paramType'][0] === 'array'))) {
                            let res = this.isValidReturn(item.children, result[k]);
                            state = res.state;
                            op = res.op;
                            paramNameArr = Array.prototype.concat.call(paramNameArr, res.paramNameArr);
                        }
                        // else if(typeof result[k] !== item['paramType'][0]){
                        //
                        // }
                    } else {
                        state = false;
                        paramNameArr.push(k)
                    }
                }
            });
        } else {
            jsonTable.map(item => {
                if (result.hasOwnProperty(item.paramName) || item['paramName'] === 'THIS_iS_ARRAY_TYPE') {
                    let res = {};
                    // 确认条件
                    if (item['paramName'] === 'THIS_iS_ARRAY_TYPE' && (item['paramType'][0] === 'object' || item['paramType'][0] === 'array')) {
                        res = this.isValidReturn(item.children, result[0]);
                        state = res.state;
                        op = res.op;
                        paramNameArr = Array.prototype.concat.call(paramNameArr, res.paramNameArr)
                    } else if (item.hasOwnProperty('children')) {
                        res = this.isValidReturn(item.children, result[item.paramName]);
                        state = res.state;
                        op = res.op;
                        paramNameArr = Array.prototype.concat.call(paramNameArr, res.paramNameArr)
                    }
                } else {
                    state = false;
                    paramNameArr.push(item.paramName)
                }
            });
        }
        return {
            state,
            op,
            paramNameArr
        };
    };

    isValidReturns = (jsonTable, ret, i) => {
        let resultArr = ret.result;
        let params = ret.params;
        let totalCount = {
            pass: 0,
            fail: 0
        };
        let paramArr = [...this.state.paramArr];
        paramArr[i]['testResult'] = [];
        resultArr.map((res, index) => {
            let result = this.isValidReturn(jsonTable, res);
            let item = {};
            item['param'] = params[index];
            item['result'] = res;
            if (result.state) {
                totalCount.pass++;
            } else {
                let failMsg = `返回值缺少字段: ${result.paramNameArr.join(',')}`;
                item['failMsg'] = failMsg;
                totalCount.fail++;
            }
            paramArr[i]['testResult'].push(item);
            paramArr[i]['totalCount'] = totalCount;
        });
        paramArr[i]['passRate'] = Math.round(totalCount.pass / (totalCount.pass + totalCount.fail) * 10000) / 100;
        paramArr[i]['failRate'] = Math.round(totalCount.fail / (totalCount.pass + totalCount.fail) * 10000) / 100;
        if (totalCount.fail === 0) {
            paramArr[i]['status'] = 200;
        } else if (totalCount.success === 0) {
            paramArr[i]['status'] = 500
        } else if (totalCount.fail !== 0 && totalCount.success !== 0) {
            paramArr[i]['status'] = 302;
        }
        this.setState({paramArr});
    };

    reOrder = (value) => {
        this.setState({
            paramArr: value
        })
    };

    render() {

        const {pro, apis, catalogDS} = this.state;

        return (
            <section className="wiki-doc">
                <input type="text" ref="copy_panel" style={{position: 'absolute', top: -100, left: 20, zIndex: -999}}/>
                <div className={`wiki-operation-header`}>
                    <span style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        width: 550,
                        overflow: 'hidden'
                    }}>{pro.projectName}<span
                        style={{fontSize: 16}}>{`(${pro.description})`}</span></span>
                    <Button style={{float: 'right', marginRight: 20, marginTop: 19}} onClick={this.showAPIManageModal}
                            type="dashed">接口管理</Button>
                    <Button style={{float: 'right', marginRight: 20, marginTop: 19}}
                            onClick={this.showModuleManageModal} type="dashed">模块管理</Button>
                    <Button style={{float: 'right', marginRight: 20, marginTop: 19}} onClick={this.showModal}
                            type="dashed" disabled>接口测试</Button>
                </div>
                {/*目录*/}
                <div className="wiki-doc-content">
                    <Nav isShow={apis.length || catalogDS.length} moduleDiff={!!catalogDS.length}
                         dataSource={catalogDS.length ? catalogDS : apis} cb={catalog => this.catalog = catalog}/>
                    {/*接口组件实例*/}
                    <div className="api-ins-item">
                        {
                            catalogDS.length ? catalogDS.map((item, index) => {
                                return <InterfaceIns copyUrl={(e) => this.copyUrl(e, 'api')} index={item.order}
                                                     id={`interface-${item.key}`}
                                                     type={item.type} key={`interface-${index}`} interfaceIns={item}/>
                            }) : apis.map((item, index) => {
                                return <InterfaceIns copyUrl={(e) => this.copyUrl(e, 'api')}
                                                     index={item.order ? item.order : (index + 1) }
                                                     id={`interface-${item.key}`}
                                                     type={3} key={`interface-${index}`} interfaceIns={item}/>
                            })
                        }
                    </div>
                </div>
                <div className="jump-tools">
                    <Tooltip overlay={<div>返回首页</div>} placement="left">
                        <div className="back-home anchor"><Link to={"/project"}><Icon
                            style={{fontSize: 38, color: '#fff', padding: '3px 4px'}} type="home"/></Link></div>
                    </Tooltip>
                    <Tooltip overlay={<div>文档分享</div>} mouseLeaveDelay={0} placement="left">
                        <div className="share anchor"><a onClick={(e) => this.copyUrl(e, 'pro')}><Icon
                            style={{fontSize: 34, color: '#fff', padding: '4px 5px'}} type="share-alt"/></a></div>
                    </Tooltip>
                    <Tooltip overlay={<div>返回顶部</div>} mouseLeaveDelay={0} placement="left">
                        <div className="back-top anchor" style={{opacity: this.state.scroll ? '1' : '0'}}><a
                            onClick={this.scrollTop}><Icon style={{fontSize: 38, color: '#fff', padding: '3px 4px'}}
                                                           type="up"/></a></div>
                    </Tooltip>
                </div>
                <Modal
                    title="接口管理"
                    visible={this.state.editPanelVisible}
                    width={1280}
                    maskClosable={false}
                    footer={[<Button key="closeApiManage" onClick={this.hideAPIManageModal}>关闭</Button>]}
                    onCancel={this.hideAPIManageModal}
                >
                    <ApiManage editable={false} pro={this.state.pro} module={this.state.module}
                               rootId={this.state.rootId}/>
                </Modal>
                <Modal
                    title={<span>模块管理
                        <Tooltip placement="right" overlay={<div>
                            <div>1. 不推荐进行删除操作</div>
                            <br/>
                            <div>2. 即将开放修改接口</div>
                            <br/>
                            <div>3. 模块删除后 子接口默认移至系统模块</div>
                        </div>}>
                            <Icon type="info-circle-o"/>
                        </Tooltip>
                    </span>}
                    visible={this.state.moduleManageVisible}
                    width={600}
                    maskClosable={false}
                    footer={[<Button key="closeModuleManage" onClick={this.hideModuleManageModal}>关闭</Button>]}
                    onCancel={this.hideModuleManageModal}
                >
                    <ModuleManage pro={this.state.pro}/>
                </Modal>
                <section ref="modal" className="api-test-area">
                    <div className="api-test-tab-area">
                        <DragPanel reOrder={this.reOrder} apis={this.state.paramArr} sort={this.state.sort}/>
                        <div className="mask" ref="mask"></div>
                        <Loading style={{display: this.state.isSend ? 'block' : 'none'}}/>
                        {/*<div className="test-api-datalist">*/}
                        {/*<div className="test-api-header clearfix">*/}
                        {/*<span>排序</span>*/}
                        {/*<span>接口URL</span>*/}
                        {/*<span>通过率</span>*/}
                        {/*<span>测试结果</span>*/}
                        {/*</div>*/}
                        {/*<div className="test-api-list">*/}
                        {/*<div className="test-api-item clearfix" onClick={this.showChild.bind(this)}>*/}
                        {/*<div>*/}
                        {/*<span>*/}
                        {/*<Icon className="dl-up" type="up-square-o"/>*/}
                        {/*<Icon className="dl-down" type="down-square-o"/>*/}
                        {/*</span>*/}
                        {/*<span>www.baidu.com</span>*/}
                        {/*<span>240/250</span>*/}
                        {/*<span><Tag type="pass"/></span>*/}
                        {/*</div>*/}
                        {/*<div className="api-test-detail">*/}
                        {/*<div>1</div>*/}
                        {/*<div>2</div>*/}
                        {/*<div>3</div>*/}
                        {/*<div>4</div>*/}
                        {/*<div>5</div>*/}
                        {/*<div>2</div>*/}
                        {/*<div>3</div>*/}
                        {/*<div>4</div>*/}
                        {/*<div>5</div>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*<div className="test-api-list">*/}
                        {/*<div className="test-api-item clearfix" onClick={this.showChild.bind(this)}>*/}
                        {/*<span>*/}
                        {/*<Icon className="dl-up" type="up-square-o"/>*/}
                        {/*<Icon className="dl-down" type="down-square-o"/>*/}
                        {/*</span>*/}
                        {/*<span>www.baidu.com</span>*/}
                        {/*<span>240/250</span>*/}
                        {/*<span><Tag type="review"/></span>*/}
                        {/*<div className="api-test-detail">show this</div>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*<div className="test-api-list">*/}
                        {/*<div className="test-api-item clearfix" onClick={this.showChild.bind(this)}>*/}
                        {/*<span>*/}
                        {/*<Icon className="dl-up" type="up-square-o"/>*/}
                        {/*<Icon className="dl-down" type="down-square-o"/>*/}
                        {/*</span>*/}
                        {/*<span>www.baidu.com</span>*/}
                        {/*<span>240/250</span>*/}
                        {/*<span><Tag type="fail"/></span>*/}
                        {/*<div className="api-test-detail">show this</div>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                    </div>
                    {/*<div className="wrapper">*/}
                        {/*<div className="api-form-area">*/}
                            {/*<div className="api-title">接口测试</div>*/}
                            {/*<div className="api-input-area">*/}
                                {/*<div className="form-item">*/}
                                    {/*<div>请求URL</div>*/}
                                    {/*<div>*/}
                                        {/*<Input placeholder={"请输入后台域名及端口号"} value={this.state.url}*/}
                                               {/*onChange={(e) => this.setInput('url', e)}/>*/}
                                    {/*</div>*/}
                                {/*</div>*/}
                                {/*<div className="form-item">*/}
                                    {/*<div>cookie</div>*/}
                                    {/*<div>*/}
                                        {/*<Input value={this.state.cookie} autosize={{minRows: 5, maxRows: 10}}*/}
                                               {/*type="textarea" onChange={(e) => this.setInput('cookie', e)}/>*/}
                                    {/*</div>*/}
                                {/*</div>*/}
                                {/*<div className="form-item">*/}
                                    {/*<Button style={{width: '100%'}} type="primary"*/}
                                            {/*onClick={this.startTestApi}>{this.state.isSend ?*/}
                                        {/*<Icon style={{fontSize: 16}} type="loading"/> : 'Send!'}</Button>*/}
                                {/*</div>*/}
                            {/*</div>*/}
                            {/*<div className="api-switch">*/}
                                {/*<span onClick={this.changeStatus}>{this.state.sort ? 'Done' : 'Sort'}</span>*/}
                                {/*<span onClick={this.hideModal}>Close</span>*/}
                            {/*</div>*/}
                        {/*</div>*/}
                    {/*</div>*/}
                </section>
            </section>
        )

    }

}

export default WikiDoc;