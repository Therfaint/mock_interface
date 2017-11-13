/**
 * Created by therfaint- on 01/11/2017.
 */
import React, {Component, PropTypes} from 'react';
import Message from 'antd/lib/message';
import Input from 'antd/lib/input';
import Icon from 'antd/lib/icon';
import Checkbox from 'antd/lib/checkbox';
import Select from 'antd/lib/select';
import Tooltip from 'antd/lib/tooltip';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';

const Option = Select.Option;

import moment from 'moment';
import 'moment/locale/zh-cn';
import VoteArea from "./voteArea";

moment.locale('zh-cn');

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

class ProManage extends Component {

    constructor(props) {
        super(props);
        this.state = {

            searchType: 'projectName',
            input: '',

            status: false,

            pros: [],
            createProVisible: false,
            projectCode: '',
            projectName: '',
            description: '',

            down: false
        };
        this.deleteIdArr = [];
    }

    createPro = () => {
        $.ajax({
            url: '/queryByCodeOrName.json',
            method: 'POST',
            data: {
                searchType: 'projectCode',
                input: this.state.projectCode
            },
            dataType: 'JSON',
            success: data => {
                if(data.success && data.result.length === 0){
                    $.ajax({
                        url: '/savePro.json',
                        method: 'POST',
                        data: {
                            projectCode: this.state.projectCode,
                            projectName: this.state.projectName,
                            description: this.state.description,
                            createTime: moment().format(dateFormat)
                        },
                        dataType: 'JSON',
                        success: data => {
                            if (data.success) {
                                Message.success('项目创建成功');
                                this.getAllPros();
                                this.createModule(data.id);
                            } else {
                                Message.error('项目创建失败');
                            }
                        }
                    })
                }else{
                    Message.error('该项目编号已存在');
                }
            }
        })
    };

    createModule = (id) => {
        $.ajax({
            url: '/saveModule.json',
            method: 'POST',
            data: {
                moduleName: '系统目录',
                description: '系统默认模块',
                proId: id
            },
            dataType: 'JSON',
            success: data => {
                if(data.success){
                    Message.success('项目模块初始化成功');
                    this.setState({
                        createProVisible: false
                    });
                    setTimeout(function () {
                        window.location.href = `/wiki/pageId=${id}`;
                        // window.open(`/wiki/pageId=${id}`)
                    }, 3000);
                }else{
                    Message.error(data.msg)
                }
            }
        })
    };

    queryPro = (input) => {
        $.ajax({
            url: '/queryByCodeOrName.json',
            method: 'POST',
            data: {
                searchType: this.state.searchType,
                input: input
            },
            dataType: 'JSON',
            success: data => {
                if(data.success){
                    this.setState({
                        pros: data.result
                    })
                }else{
                    Message.error(data.msg)
                }
            }
        })
    };

    getAllPros = () => {
        $.ajax({
            url: '/getAllPro.json',
            method: 'GET',
            dataType: 'JSON',
            success: data => {
                if (data.success) {
                    this.setState({
                        pros: data.result
                    })
                } else {
                    Message.error(data.msg);
                }
            }
        })
    };

    showCreateProModal = () => {
        this.setState({
            projectCode: '',
            projectName: '',
            description: '',
            createProVisible: true
        })
    };

    hideCreateProModal = (status) => {
        if (status) {
            if (!this.state.projectCode) {
                Message.error('请输入项目编号');
                return;
            }
            if (!this.state.projectName) {
                Message.error('请输入项目名称');
                return;
            }
            if (!this.state.description) {
                Message.error('请输入项目描述');
                return;
            }
            // 正则判断项目编号
            if(!this.state.projectCode.match(/^[0-9a-zA-Z_]+$/)){
                Message.error('项目编号只能由英文、数字和下划线组成');
                return;
            }
            this.createPro();
        } else {
            this.setState({
                createProVisible: false
            });
        }
    };

    clearInput = () => {
        this.setState({input: ''});
        this.getAllPros();
    };

    handleTypeChange = (value) => {
        this.setState({searchType: value});
    };

    handleInputChange = (e, type) => {
        let state = {};
        state[type] = e.target.value;
        this.setState(state);
        if(type === 'input'){
            this.queryPro(e.target.value);
        }
    };

    setDeleteArr = (e, id) => {
        let bool = e.target.checked, arr = [...this.deleteIdArr];
        if(bool){
            arr.push(id);
        }else{
            arr.map((item,index)=>{
                if(item === id){
                    arr.splice(index, 1)
                }
            })
        }
        this.deleteIdArr = arr;
        console.log(this.deleteIdArr);
    };

    changeStatus = () => {
        if(this.state.status){
            Modal.confirm({
                content: '确认删除选中条目？',
                okText: '确定',
                cancelText: '取消',
                onOk: () => {
                    $.ajax({
                        url: '/deletePro.json',
                        data: {
                            id: this.deleteIdArr
                        },
                        method: 'POST',
                        dataType: 'JSON',
                        success: data => {
                            if(data.success){
                                Message.success('删除成功');
                                this.deleteIdArr = [];
                                this.setState({status: false});
                            }else{
                                Message.error(data.msg)
                            }
                            this.getAllPros();
                        }
                    })
                },
                onCancel: () => {
                    this.setState({status: false});
                }
            });
        }else{
            this.setState({status: true});
        }
    };

    linkToWiki = (item) => {
        window.location.href = `/wiki/pageId=${item._id}`;
        // window.open(`/wiki/pageId=${item._id}`);
    };

    componentDidMount() {
        this.getAllPros();
        // window.onscroll = (e) => {
        //     this.setState({
        //         down: window.scrollY > 66
        //     })
        // }
    }

    render() {
        return (
            <section className="pro-container">
                <div className={`search-fixed-header ${this.state.down ? 'down' : ''}`}>
                    <Select value={this.state.searchType} style={{width: 88}} onChange={this.handleTypeChange}>
                        <Option value="projectName">项目名称</Option>
                        <Option value="projectCode">项目编号</Option>
                    </Select>
                    <Input placeholder={this.state.searchType === 'projectName' ? "根据项目名查询" : "根据项目编号"} style={{width: 400, marginLeft: 9}} onChange={(e)=>this.handleInputChange(e, 'input')}
                           value={this.state.input} suffix={ this.state.input ? <Icon type="close-circle" className="clear-input" onClick={this.clearInput}/> : null}/>
                    <Button style={{float: 'right', marginRight: 33, marginTop: 19}} key="createPro"
                            onClick={this.showCreateProModal} type="dashed">创建</Button>
                    {/*<Button style={{float: 'right', marginRight: 20, marginTop: 19}} key="deletePro"*/}
                            {/*onClick={this.changeStatus} type="dashed">*/}
                        {/*{*/}
                            {/*this.state.status ? '删除' : '管理'*/}
                        {/*}*/}
                    {/*</Button>*/}
                </div>
                <div className="pro-items-container">
                    {
                        this.state.pros ? this.state.pros.map(item => {
                            return (
                                <div key={item._id} className="pro-item">
                                    <Checkbox style={{display: (this.state.status ? 'inline-block' : 'none'), height: 32}} onChange={(e)=>this.setDeleteArr(e, item._id)}/>
                                    {
                                        item.tag ? <span className="keep-top-tag">置顶</span> : null
                                    }
                                    <Tooltip  placement="right" overlay={<div>{item.description}</div>}>
                                        <a onClick={() => this.linkToWiki(item)} style={{maxWidth: 900}}>{`${item.projectName}(编号: ${item.projectCode})`}</a>
                                    </Tooltip>
                                    <a style={{float: 'right', marginRight: 33}}>{item.lastUpdateTime}</a>
                                </div>
                            )
                        }) : null
                    }
                </div>
                <VoteArea/>
                <Modal
                    title={<span>创建项目
                        <Tooltip placement="right" overlay={<div><div>1.项目编号不可重复</div>
                            <br/><div>项目编号只能由英文、数字和下划线组成</div>
                            <br/><div>2.推荐命名规则: 项目代号+版本号</div>
                            <br/><div>其中 " . " 用 " _ " 代替</div>
                            <br/><div>3.项目编号实例: shine1_2</div>
                        </div>}>
                            <Icon type="info-circle-o" />
                        </Tooltip>
                    </span>}
                    visible={this.state.createProVisible}
                    onOk={() => this.hideCreateProModal(true)}
                    maskClosable={false}
                    onCancel={() => this.hideCreateProModal(false)}>
                    <div>
                        <div className="clearfix" style={{width: 400, margin: '0 auto 9px'}}>
                            <span style={{lineHeight: '28px', verticalAlign: 'middle'}}>项目编号：</span>
                            <span><Input style={{width: 300, float: 'right'}} value={this.state.projectCode}
                                         placeholder="请输入项目编号"
                                         onChange={(e) => this.handleInputChange(e, 'projectCode')}/></span>
                        </div>
                        <div className="clearfix" style={{width: 400, margin: '0 auto 9px'}}>
                            <span style={{lineHeight: '28px', verticalAlign: 'middle'}}>项目名称：</span>
                            <span><Input style={{width: 300, float: 'right'}} value={this.state.projectName}
                                         placeholder="请输入项目名称"
                                         onChange={(e) => this.handleInputChange(e, 'projectName')}/></span>
                        </div>
                        <div className="clearfix" style={{width: 400, margin: '0 auto'}}>
                            <span style={{lineHeight: '28px', verticalAlign: 'middle'}}>项目描述：</span>
                            <span><Input style={{width: 300, float: 'right'}} value={this.state.description}
                                         placeholder="请输入项目描述"
                                         onChange={(e) => this.handleInputChange(e, 'description')}/></span>
                        </div>
                    </div>
                </Modal>
            </section>
        )
    }

}

export default ProManage;
