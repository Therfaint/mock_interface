/**
 * Created by therfaint- on 14/08/2017.
 */
import React from 'react';
import Message from 'antd/lib/message';
import Icon from 'antd/lib/icon';
import Table from 'antd/lib/table';
import Cascader from 'antd/lib/cascader';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';
import Notification from 'antd/lib/notification';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

import EditableCell from './editable_cell';

Message.config({
    duration: 2,
});

Notification.config({
    duration: 9,
});

const options = [{
    value: 'string',
    label: 'String',
    children: [{
        value: '@id',
        label: 'Id'

    }, {
        value: '@name',
        label: 'Name'

    }, {
        value: '@sex',
        label: 'Sex'

    }, {
        value: '@url',
        label: 'Url'

    }, {
        value: '@email',
        label: 'E-mail'

    }, {
        value: '@address',
        label: 'Address'

    }, {
        value: '@ip',
        label: 'Ip'

    }, {
        value: '@rate',
        label: 'Rate'

    }, {
        value: '@date',
        label: 'Date'

    }, {
        value: '@datetime',
        label: 'DateTime'

    }, {
        value: '@version',
        label: 'Version'

    }],
}, {
    value: 'number',
    label: 'Number',
    children: [{
        value: '10',
        label: '10'
    }, {
        value: '20',
        label: '20'
    }, {
        value: '50',
        label: '50'
    }, {
        value: '100',
        label: '100'
    },{
        value: '200',
        label: '200'
    }, {
        value: '0-1',
        label: 'INT[0, 1]'
    }, {
        value: '.0-1',
        label: 'FLOAT[0, 1]'
    }, {
        value: '0-10',
        label: 'INT[0, 10]'
    }, {
        value: '.0-10',
        label: 'FLOAT[0, 10]'
    }, {
        value: '0-100',
        label: 'INT[0, 100]'
    }, {
        value: '.0-100',
        label: 'FLOAT[0, 100]'
    }, {
        value: '0-1000',
        label: '[0, 1,000]'
    }, {
        value: '0-10000',
        label: '[0, 10,000]'
    }, {
        value: '10000-1000000',
        label: '[10,000, 1,000,000]'
    }],
}, {
    value: 'boolean',
    label: 'Boolean',
    children: [{
        value: true,
        label: 'True'

    }, {
        value: false,
        label: 'False'

    }],
}, {
    value: 'object',
    label: 'Object'
}, {
    value: 'array',
    label: 'Array',
    children: [{
        value: '2',
        label: 'Array(2)'
    },{
        value: '3',
        label: 'Array(3)'
    },{
        value: '5',
        label: 'Array(5)'
    }, {
        value: '10',
        label: 'Array(10)'

    }, {
        value: '20',
        label: 'Array(20)'

    }, {
        value: '30',
        label: 'Array(30)'

    }, {
        value: '50',
        label: 'Array(50)'

    }],
},];

class ParamDefine extends React.Component {

    constructor(props) {
        super(props);
        this.columns = [{
            title: '字段',
            key: 'paramName',
            dataIndex: 'paramName',
            render: (text, record, index) => (
                <EditableCell
                    key="paramName"
                    value={record.paramName}
                    onChange={this.onCellChange(record, 'paramName')}
                />
            )
        }, {
            title: '类型',
            key: 'paramType',
            dataIndex: 'paramType',
            render: (text, record, index) => (
                // 类型选择下拉
                <Cascader
                    placeholder="请选择"
                    style={{width: 150}}
                    value={record.paramType}
                    options={options}
                    expandTrigger="hover"
                    displayRender={this.displayRender}
                    onChange={(value) => this.handleChange(value, record)}
                />
            )
        }, {
            title: '自定义参数',
            key: 'usrDefine',
            dataIndex: 'usrDefine',
            render: (text, record, index) => (
                <EditableCell
                    key="usrDefine"
                    value={record.usrDefine}
                    onChange={this.onCellChange(record, 'usrDefine')}
                />
            )
        }, {
            title: '说明',
            key: 'illustration',
            dataIndex: 'illustration',
            render: (text, record, index) => (
                <EditableCell
                    key="illustration"
                    value={record.illustration}
                    onChange={this.onCellChange(record, 'illustration')}
                />
            )
        }, {
            title: '操作',
            key: 'operation',
            dataIndex: 'operations',
            render: (text, record, index) => (
                <div>
                    <Icon type="minus-circle-o" style={{fontSize: 18, marginLeft: 3, cursor: 'pointer'}}
                          onClick={() => this.onDelete(record)}/>
                    <Icon type="plus-circle-o" style={{fontSize: 18, marginLeft: 5, cursor: 'pointer'}}
                          onClick={() => this.handleAdd(record)}/>
                </div>
            )
        }];
        this.state = {
            dataSource: [{
                key: '1',
                paramName: '',
                paramType: [],
                usrDefine: '',
                illustration: '',
                path: '1'
            }],
            count: 998
        };
    }

    dataSourceClean = (dataSource) => {
        dataSource.map(item => {
            if (item.hasOwnProperty('children')) {
                if (item['children'].length === 0) {
                    delete item['children'];
                    item['paramType'] = [];
                } else {
                    this.dataSourceClean(item['children']);
                }
            }
        });
        return dataSource;
    };

    onCellChange = (record, key) => {
        return (value) => {
            if (value.toString().indexOf('array') !== -1 && key === 'usrDefine') {
                this.handleChange(['array'], record, false);
            }
            let indexes, dataSource = [...this.state.dataSource];
            let curIndex, data = dataSource;
            indexes = record.path.split("/");
            for (let i = 0; i < indexes.length; i++) {
                data.map((item, index) => {
                    if (item['key'] === indexes[i]) {
                        curIndex = index;
                    }
                });
                if (i + 1 === indexes.length) {
                    data[curIndex][key] = value;
                    this.setState({
                        dataSource
                    })
                } else {
                    data = data[curIndex]['children'];
                }
            }
        };
    };

    onDelete = (record) => {
        let indexes, dataSource = [...this.state.dataSource];
        let curIndex, data = dataSource;
        indexes = record.path.split("/");
        if (indexes.length === 1) {
            if (dataSource.length === 1)
                return;
            dataSource.map((item, index) => {
                if (item['key'] === indexes[0]) {
                    dataSource.splice(index, 1);
                }
            });
            this.setState({dataSource})
        } else {
            for (let i = 0; i < indexes.length; i++) {
                data.map((item, index) => {
                    if (item['key'] === indexes[i]) {
                        curIndex = index;
                    }
                });
                if (i + 2 === indexes.length) {
                    data = data[curIndex]['children'];
                    data.map((item, index) => {
                        if (item['key'] === indexes[i + 1]) {
                            data.splice(index, 1)
                        }
                    });
                    this.setState({dataSource: this.dataSourceClean(dataSource)});
                    return;
                } else {
                    data = data[curIndex]['children'];
                }
            }
        }
    };

    handleChange = (value, record) => {
        let indexes, children,
            dataSource = [...this.state.dataSource];
        let curIndex, data = dataSource;
        indexes = record.path.split("/");
        for (let i = 0; i < indexes.length; i++) {
            data.map((item, index) => {
                if (item['key'] === indexes[i]) {
                    curIndex = index;
                }
            });
            if (i + 1 === indexes.length) {
                data[curIndex]['paramType'] = value;
                if (value[0] === 'object' || value[0] === 'array') {
                    let paramName;
                    if (value[0] === 'object') {
                        paramName = '';
                    } else if (value[0] === 'array') {
                        paramName = 'array';
                    }
                    if (!data[curIndex].hasOwnProperty('children')) {
                        data[curIndex]['children'] = [];
                        data[curIndex]['children'].push({
                            key: String(this.state.count),
                            paramName,
                            paramType: [],
                            usrDefine: '',
                            illustration: '',
                            path: record.path + '/' + this.state.count
                        });
                    }
                } else {
                    delete data[curIndex]['children'];
                }
                this.setState({
                    dataSource,
                    count: this.state.count + 1
                })
            } else {
                data = data[curIndex]['children'];
            }
        }
    };

    handleAdd = (record) => {
        let path, addStatus = true, indexes, children = [...this.state.dataSource],
            dataSource = [...this.state.dataSource];
        indexes = record.path.split("/");
        indexes.pop();
        path = indexes.join("/");
        if (indexes.length) {
            for (let i = 0; i < indexes.length; i++) {
                children.map(item => {
                    if (item['key'] === indexes[i]) {
                        if (i + 1 === indexes.length && item['paramType'][0] === 'array' && item['children'].length === 1)
                            addStatus = false;
                        else children = item.children;
                    }
                })
            }
            if (!addStatus) {
                return;
            }
            const newParam = {
                key: String(this.state.count),
                paramName: '',
                paramType: [],
                usrDefine: '',
                illustration: '',
                path: path + '/' + this.state.count
            };
            children.push(newParam);
            this.setState({
                dataSource,
                count: this.state.count + 1
            });
        } else {
            const newParam = {
                key: String(this.state.count),
                paramName: '',
                paramType: [],
                usrDefine: '',
                illustration: '',
                path: String(this.state.count)
            };
            this.setState({
                dataSource: [...dataSource, newParam],
                count: this.state.count + 1
            });
        }
    };

    displayRender = (label) => {
        return label[label.length - 1];
    };

    getDeepestCount = (dataSource) => {
        let count = 0;
        dataSource.map(item => {
            if (item.hasOwnProperty('children')) {
                count = this.getDeepestCount(item['children']);
            } else {
                let pathArr = item['path'].split('/');
                let index;
                if (pathArr.length && (index = pathArr.pop())) {
                    if (index > count) {
                        count = index;
                    }
                }
            }
        });
        return count;
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource && nextProps.dataSource.length) {
            this.setState({
                dataSource: nextProps.dataSource,
                count: this.getDeepestCount(nextProps.dataSource) + 1
            })
        } else {
            this.setState({
                dataSource: [{
                    key: '1',
                    paramName: '',
                    paramType: [],
                    usrDefine: '',
                    illustration: '',
                    path: '1'
                }]
            })
        }
    }

    render() {

        const {title, visible, onOk, onCancel} = this.props;
        const {dataSource} = this.state;

        const footer = [
            <Button key="back" size="large" onClick={onCancel}>关闭</Button>,
            <Button key="submit" type="primary" size="large" onClick={() => onOk(this.state.dataSource)}>保存</Button>
        ];

        const paramModel = (
            <Table
                size="small"
                dataSource={ dataSource }
                columns={ this.columns }
                pagination={ false }
                // defaultExpandAllRows={true}
            />
        );

        return (

            <section>

                <Modal
                    visible={visible}
                    title={title}
                    onCancel={onCancel}
                    footer={footer}
                    maskClosable={false}
                    width={1000}>
                    {
                        paramModel
                    }
                </Modal>

            </section>

        )
    }
}

export default ParamDefine;