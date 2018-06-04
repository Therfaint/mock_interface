/**
 * Created by therfaint- on 01/12/2017.
 */
import React from 'react';
import Icon from 'antd/lib/icon';

class DragPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            sort: false
        };
        this.isFirstEnter = true;
        this.isFirstLeave = true;
        this.preState = this.state.data;
        this.dragItem = {};
        this.status = true;
    }

    componentWillReceiveProps = (nextProps, nextState) => {
        this.setState({
            data: nextProps.apis,
            sort: nextProps.sort
        })
    };

    componentWillMount = () => {

    };

    componentDidMount = () => {
        this.setState({
            data: this.props.apis
        });
        let panelTab = this.refs['panel-tab'];
        // 开始拖动
        panelTab.addEventListener('dragstart', (e) => {
            let index = Number(e.target.getAttribute('data-index'));
            this.dragItem = this.state.data[index];
            this.isFirstEnter = true;
            this.isFirstLeave = true;
            this.status = true;
            this.preState = this.state.data;
        });
        // 拖动过程
        panelTab.addEventListener('drag', (e) => {

        });
        // 拖过
        document.getElementsByClassName('api-test-tab-area')[0].addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        // 拖入
        panelTab.addEventListener('dragenter', (e) => {
            e.preventDefault();
            // 1.等于初始元素 不处理 2.移入某个元素 产生一个新的数据 后续数据后移
            if (this.isFirstEnter) {
                this.isFirstEnter = false;
                this.status = true;
            } else if (e.target.classList.contains('panel-tab') && this.status === false) {
                this.status = true;
                let index = Number(e.target.getAttribute('data-index'));
                // if(this.enterCount !== index || this.count > 0){
                let data = this.state.data;
                this.preState = [...this.state.data];
                data.map(item => {
                    if (item.index >= index) {
                        item.index = item.index + 1;
                    }
                });
                data.splice(index, 0, {index, type: 'ph'});
                this.setState({
                    data
                });
                // }
            }
            // }
        });
        // 拖出
        panelTab.addEventListener('dragleave', (e) => {
            // 1.选择操作对象离开后，删除该元素的位置 2.移出某个元素 回滚到移入时的状态
            e.preventDefault();
            if (this.isFirstLeave) {
                let index = Number(e.target.getAttribute('data-index'));
                this.isFirstLeave = false;
                this.status = false;
                let data = [...this.state.data];
                data.splice(index, 1);
                data.map(item => {
                    if (item.index >= index) {
                        item.index = item.index - 1;
                    }
                });
                this.setState({
                    data
                })
            } else if (e.target.classList.contains('panel-tab') && this.status === true) {
                this.status = false;
                this.preState.map((item, index) => {
                    item.index = index
                });
                this.setState({
                    data: this.preState
                })
            }

        });
        // 放置
        document.getElementsByClassName('api-test-tab-area')[0].addEventListener('drop', (e) => {
            e.preventDefault();
            let i = 0;
            let isMid = false;
            let data = [...this.state.data];
            if(this.isFirstLeave || this.isFirstEnter){
                return;
            }else{
                data.map((item, index) => {
                    if (item.type === 'ph') {
                        isMid = true;
                        i = index;
                    }
                });
                if (e.target.classList.contains('panel-tab') && isMid) {
                    this.dragItem['index'] = i;
                    data.splice(i, 1, this.dragItem);
                }else {
                    this.dragItem['index'] = data.length;
                    data.push(this.dragItem);
                }
                this.setState({
                    data
                });
                // 设置wikidoc的state
                this.props.reOrder(data);
            }
        })
    };

    render() {
        const clazzName = this.state.sort ? 'sort' : '';
        return (
            <div className={`wrap clearfix ${clazzName}`} ref="panel-tab">
                {
                    this.state.data.map((item, index) => {
                        return (<div key={index} data-index={item.index}
                                     className={item.type === 'ph' ? `panel-tab placeholder` : `panel-tab`}
                                     draggable="true">
                            <div className="tab-item-left">
                                <div>{item.url}</div>
                                <div>
                                    {/*样式 周末调整一下*/}
                                    {
                                        item.hasOwnProperty('passRate') && item.hasOwnProperty('failRate') ?
                                            (
                                                <span style={{width: 150, display: 'inline-block',height: 5}}>
                                                    <span style={{backgroundColor: 'green', width: item.passRate + '%', display: 'inline-block'}}></span>
                                                    <span style={{backgroundColor: 'red', width: item.failRate + '%', display: 'inline-block'}}></span>
                                                </span>
                                            ) : null
                                    }
                                </div>
                                <div>
                                    {
                                        item.hasOwnProperty('totalCount') ? `${item.totalCount.pass} passed    ${item.totalCount.fail} failed` : null
                                    }
                                </div>
                            </div>
                            <div className="tab-item-right">
                                <span>
                                    {
                                        item.hasOwnProperty('status') && item.status === 200 ? item.status : (item.status === 302 ? item.status : (item.status === 500 ? item.status : null))
                                    }
                                </span>
                                    <span>
                                    {
                                        item.hasOwnProperty('duration') ? item.duration : null
                                    }
                                </span>

                                    <span>
                                    {
                                        item.hasOwnProperty('testResult') ? <Icon type="info-circle-o" /> : null
                                    }
                                </span>
                            </div>
                        </div>)
                    })
                }
            </div>

        )
    }
}

export default DragPanel;