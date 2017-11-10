/**
 * Created by therfaint- on 30/10/2017.
 */
import React from 'react';
import { Link} from "react-router-dom";
import Message from 'antd/lib/message';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import Select from 'antd/lib/select';
import Table from 'antd/lib/table';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Notification from 'antd/lib/notification';
import ApiManage from './apiManage';
import ModuleManage from './moduleManage';
import Catalog from './catalog';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

import JsonFormatter from '../util/JSON_Format';

import InterfaceIns from './interfaceIns';

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

class WikiDoc extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pro: {},
            module: [],
            apis: [],

            catalogDS: [],

            rootId: '',

            editPanelVisible: false,
            moduleManageVisible: false,

            pageId: undefined,

            down: false
        };
        this.apis = [];
    }

    handleTableDS = (arr, indent, type, arrName) => {
        let retDS = [];
        if (arr && arr.length) {
            arr.map(item => {
                let obj = {};
                // todo 考虑将array和object的字段进行修饰
                if(type === 'Array'){
                    obj['paramName'] = arrName + '[i]';
                }else{
                    obj['paramName'] = item.paramName;
                }
                obj['illustration'] = item.illustration;
                obj['indent'] = indent;
                if (item.hasOwnProperty('paramType')) {
                    obj['paramType'] = this.dataTypeFormatter(item.paramType);
                }
                retDS.push(obj);
                if (item.hasOwnProperty('children')) {
                    retDS = retDS.concat(this.handleTableDS(item.children, indent+1, obj['paramType'], obj['paramName']));
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
                if(parentIndex){
                    obj['order'] = parentIndex + '.' + count;
                }else{
                    obj['order'] = String(count);
                }
                obj['type'] = item.type;
                obj['key'] = item.key;
                if (item.hasOwnProperty('children') || parentIndex) {
                    retDS.push(obj);
                    retDS = retDS.concat(this.formatCatalogData(item['children'], count));
                    count ++;
                }
            })
        }
        return retDS;
    };

    formatWikiDocData = (data, isArray) => {
        if(isArray){
            let res = [...data],
                jsonTable,
                paramTable;
            res.map(item => {
                let arr = item.url.split('/');
                arr.splice(0,2);
                item.url = '/' + arr.join('/');
                item.key = item._id;
                try {
                    jsonTable = JSON.parse(item.jsonTable);
                } catch (e) {
                    jsonTable = [];
                } finally {
                    item.jsonTable = this.handleTableDS(jsonTable,1);
                }
                try {
                    paramTable = JSON.parse(item.paramTable);
                } catch (e) {
                    paramTable = [];
                } finally {
                    item.paramTable = this.handleTableDS(paramTable,1);
                }
                try {
                    item.json = JF.isString(item.json) ? item.json : (JSON.parse(item.json) instanceof Array ? JF.toJsonObj(JSON.parse(item.json), 1, true) : (JSON.parse(item.json) instanceof Object ? JF.toJsonObj(JSON.parse(item.json), 1, false) : null));
                } catch (e) {
                    item.json = '{/n/n}';
                }
            });
            return res;
        }else{
            let res = {...data},
                jsonTable,
                paramTable;
            let arr = res.url.split('/');
            arr.splice(0,2);
            res.url = '/' + arr.join('/');
            res.key = res._id;
            try {
                jsonTable = JSON.parse(res.jsonTable);
            } catch (e) {
                jsonTable = [];
            } finally {
                res.jsonTable = this.handleTableDS(jsonTable,1);
            }
            try {
                paramTable = JSON.parse(res.paramTable);
            } catch (e) {
                paramTable = [];
            } finally {
                res.paramTable = this.handleTableDS(paramTable,1);
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
        $.ajax({
            url: '/getAllApiById.json?proId=' + this.state.pageId,
            method: 'GET',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    let mapObj = {};
                    if(data.result && data.result.length){
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
            }
        })
    };

    getProById = () => {
        $.ajax({
            url: '/getProById.json?id=' + this.state.pageId,
            method: 'GET',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    this.setState({
                        pro: data.result
                    })
                } else {
                    Message.error(data.msg)
                }
            }
        })
    };

    // 获取全部模块
    getAllModuleByProId = (mapObj, apis) => {
        $.ajax({
            url: '/getAllModuleById.json?proId=' + this.state.pageId,
            method: 'GET',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    let rootId = '', count = 0, isRoot = false;
                    let catalogDS = [...data.result], retDS = [];
                    data.result.map(item=>{
                        item.key = item._id;
                        if(item.moduleName === '系统目录'){
                            rootId = item._id;
                        }
                    });
                    for(let k in mapObj){
                        if(mapObj[k] && mapObj[k].length){
                            count ++;
                            if(k === rootId){
                                isRoot = true;
                            }
                        }
                    }
                    if(count !== 1 || !isRoot){
                        if(data.result.length > 1){
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
                    }else{
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
            }
        })
    };

    // 回到顶部
    scrollTop = () => {
        window.scrollTo(0,0);
    };

    // 复制链接
    copyUrl = (e, type) => {
        if(type === 'api'){
            this.refs['copy_panel'].value = `${window.location.protocol}//${window.location.host}/${this.state.pro.projectCode}${e.target.innerText}`;
        }else{
            let url = window.location.href, hash = window.location.hash, href;
            if(hash){
                href = url.split(hash)[0];
            }else{
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
        if(hash){
            href = url.split(hash)[0];
        }else{
            href = url;
        }
        pageId = href.split('pageId=')[1];
        this.setState({pageId});
        // Modal.confirm({
        //     iconType: 'info',
        //     title: '使用小贴士',
        //     content: '如果接口数量多建议先创建模块。不建议进行模块的删除。如若必须删除请在删除后刷新页面。'
        // })
    };

    componentDidMount = () => {
        this.getProById();
        this.getAPIsById();
        // window.onscroll = (e) => {
        //     this.setState({
        //         down: window.scrollY > 66
        //     })
        // }
    };

    render() {
        return (
            <section className="wiki-doc">
                <input type="text" ref="copy_panel" style={{position: 'absolute', top: -100, left: 20, zIndex: -999}}/>
                <div className={`wiki-operation-header ${this.state.down ? 'down' : ''}`}>
                    <span style={{fontSize: 24, fontWeight: 'bold'}}>{this.state.pro.projectName}<span style={{fontSize: 16}}>{`(${this.state.pro.description})`}</span></span>
                    <Button  style={{float: 'right', marginRight: 20, marginTop: 19}}  onClick={(e)=>this.copyUrl(e, 'pro')} type="dashed"><Icon type="share-alt"/>分享</Button>
                    <Button  style={{float: 'right', marginRight: 20, marginTop: 19}}  onClick={this.showAPIManageModal} type="dashed">接口管理</Button>
                    <Button  style={{float: 'right', marginRight: 20, marginTop: 19}}  onClick={this.showModuleManageModal} type="dashed">模块管理</Button>
                </div>
                {/*目录*/}
                <div className="wiki-doc-content">
                    <div className={ this.state.apis.length || this.state.catalogDS.length ? "nav-container" : ''}>
                        {
                            this.state.catalogDS.length ? this.state.catalogDS.map((item, index) => {
                                return (<div key={`navTo-${index}`} className="nav-item-container">
                                    <a className={"nav_interface catalog-" + item.type}
                                       href={`#interface-${item.key}`}>{`${item.order} ${item.description}`}</a>
                                </div>)
                            }) : this.state.apis.map((item, index) => {
                                return (<div key={`navTo-${index}`} className="nav-item-container">
                                    <a className="nav_interface"
                                       href={`#interface-${item.key}`}>{item.description}</a>
                                </div>)
                            })
                        }
                    </div>
                    {/*接口组件实例*/}
                    <div className="api-ins-item">
                        {
                            this.state.catalogDS.length ? this.state.catalogDS.map((item, index) => {
                                return <InterfaceIns copyUrl={(e)=>this.copyUrl(e, 'api')} index={item.order} id={`interface-${item.key}`}
                                                     type={item.type} key={`interface-${index}`} interfaceIns={item}/>
                            }) : this.state.apis.map((item, index) => {
                                return <InterfaceIns copyUrl={(e)=>this.copyUrl(e, 'api')} index={item.order ? item.order : (index + 1) } id={`interface-${item.key}`}
                                                     type={3} key={`interface-${index}`} interfaceIns={item}/>
                            })
                        }
                    </div>
                </div>
                <div className="jump-tools">
                    <div className="back-home"><Link to={"/project"}>返回首页  <Icon type="rollback"/></Link></div>
                    <div className="back-top"><a onClick={this.scrollTop}>回到顶部  <Icon type="up"/></a></div>
                </div>
                <Modal
                    title="接口管理"
                    visible={this.state.editPanelVisible}
                    width={1200}
                    maskClosable={false}
                    footer={[<Button key="closeApiManage" onClick={this.hideAPIManageModal}>关闭</Button>]}
                    onCancel={this.hideAPIManageModal}
                >
                    <ApiManage pro={this.state.pro} module={this.state.module} rootId={this.state.rootId}/>
                </Modal>
                <Modal
                    title={<span>模块管理
                        <Tooltip placement="right" overlay={<div><div>1.不推荐进行删除操作</div>
                            <br/><div>2.删除模块后子接口默认移至系统模块</div>
                        </div>}>
                            <Icon type="info-circle-o" />
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
            </section>
        )

    }

}

export default WikiDoc;