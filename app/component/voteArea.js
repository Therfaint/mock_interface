/**
 * Created by therfaint- on 09/11/2017.
 */
import React from 'react';
import ReactDOM from 'react-dom';
//Common Components
import Icon from 'antd/lib/icon';
import Button from 'antd/lib/button';
import Input from 'antd/lib/input';
import Radio from 'antd/lib/radio';
import Form from 'antd/lib/form';
import Tooltip from 'antd/lib/tooltip';
import Checkbox from 'antd/lib/checkbox';
import Modal from 'antd/lib/modal';
import Message from 'antd/lib/message';

import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

class VoteArea extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            selected: [],
        };
        this.index = ''
    }

    onCheckBoxChange = (val) => {
        this.setState({selected: val});
    };

    submit = () => {
        $.ajax({
            url: '/saveVote.json',
            method: 'POST',
            data: {
                select: this.state.selected,
                experience: this.index
            },
            dataType: 'JSON',
            success: data => {
                window.scrollTo(0,0);
                if(data.success){
                    Message.success(data.msg);
                }else{
                    Message.error(data.msg);
                }
            }
        })
    };

    voteSatisfy = (e, index) => {
        let parentNode = this.refs['item-container'];
        let unSelectedDom;
        if(this.index){
            unSelectedDom = parentNode.childNodes[this.index];
            unSelectedDom.className = "icon-item";
        }
        let selectedDom = parentNode.childNodes[index];
        selectedDom.className = "icon-item icon-select";
        this.index = index;
    };

    componentWillMount = () => {

    };

    render() {
        return (
            <div className="user-evaluate">
                <div className="vote-container">
                    <div className="vote-area">
                        <h2>您期待下次功能迭代时能优先实现以下的哪几个功能？（建议给出您认为最重要的三条）</h2>
                        <CheckboxGroup value={this.state.selected} onChange={this.onCheckBoxChange}>
                            <div className="vote-item">
                                <Checkbox value="history" style={{fontSize:13}}>历史接口文档记录回滚</Checkbox>
                            </div>
                            <div className="vote-item">
                                <Checkbox value="document" style={{fontSize:13}}>说明文档&使用文档的完善</Checkbox>
                            </div>
                            <div className="vote-item">
                                <Checkbox value="auth" style={{fontSize:13}}>进行用户权限限制</Checkbox>
                            </div>
                            <div className="vote-item">
                                <Checkbox value="login" style={{fontSize:13}}>接入并打通域账号</Checkbox>
                            </div>
                            <div className="vote-item">
                                <Checkbox value="backend" style={{fontSize:13}}>后端接口测试工具</Checkbox>
                            </div>
                            <div className="vote-item">
                                <Checkbox value="api" style={{fontSize:13}}>接口管理工具提供更多的mock函数&类型</Checkbox>
                            </div>
                            <div className="vote-item">
                                <Checkbox value="style" style={{fontSize:13}}>页面样式&版式优化</Checkbox>
                            </div>
                        </CheckboxGroup>
                    </div>
                </div>
                <div className="vote-satisfy">
                    <h2 style={{marginBottom: 12}}>您如何评价本次的使用体验？</h2>
                    <span className="icon-list" style={{fontSize: 30}} ref="item-container">
                        <div className="icon-item" onClick={(e)=>this.voteSatisfy(e, '0')}>
                            <Icon type="smile-o" />
                            <div className="word"><span>满意</span></div>
                        </div>
                        <div className="icon-item"onClick={(e)=>this.voteSatisfy(e, '1')}>
                            <Icon type="meh-o" />
                            <div className="word"><span>凑合</span></div>
                        </div>
                        <div className="icon-item"onClick={(e)=>this.voteSatisfy(e, '2')}>
                            <Icon type="frown-o" />
                            <div className="word"><span>不满意</span></div>
                        </div>
                    </span>
                </div>
                <div className="vote-footer">
                    <div className="submit-btn">
                        <Button type="primary" onClick={this.submit}>提交</Button>
                    </div>
                    <div style={{marginTop: 40, textAlign: 'center'}}>
                        如果您在使用中遇到任何问题、有任何建议或者意见。随时欢迎钉钉上与我们交流沟通。成为该项目的contributor ~
                    </div>
                    <div style={{marginTop: 9, textAlign: 'center'}}>
                        联系人: 余孔梁(kongliang.yu@tongdun.cn) or 田鑫(xin.tian@tongdun.cn)
                    </div>
                </div>
            </div>

        )
    }

}

export default VoteArea;