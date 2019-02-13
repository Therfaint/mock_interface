/**
 * Created by therfaint- on 30/10/2017.
 */
import React from 'react';
import JsonDemo from './jsonDemo';
import Tooltip from 'antd/lib/tooltip';

class InterfaceIns extends React.Component {

    render() {

        const {interfaceIns, index, copyUrl, type} = {...this.props};

        return (
            type !== 1 ? (
                <div id={`${this.props.id}`}
                     style={type === 2 ? {marginBottom: 33, paddingLeft: 25} : {marginBottom: 20}}>
                    {/*接口描述*/}
                    <div className="interface-ins-item" style={{fontSize: 17}}>
                        <strong>{ type === 2 ? (index + ' ') : (index + '.')}</strong>
                        <strong>{interfaceIns.description}</strong>
                    </div>
                    {/*接口路径*/}
                    <div className="interface-ins-item">
                        <strong>
                            <span>接口路径：</span>
                            <Tooltip overlay={<span>点我复制接口链接</span>}><a
                                onClick={(e) => copyUrl(e)}>{interfaceIns.url}</a></Tooltip>
                        </strong>
                    </div>
                    {/*接口请求方法*/}
                    <div className="interface-ins-item">
                        <strong><span>请求方式：</span>{interfaceIns.method}</strong>
                    </div>
                    {/*接口请求Header*/}
                    <div className="interface-ins-item">
                        <strong><span>Content-Type：</span>{interfaceIns.contentType ? interfaceIns.contentType : '未定义类型'}</strong>
                    </div>
                    {/*接口入参*/}
                    <div className="interface-ins-item">

                        <div style={{marginBottom: 5}}><strong>输入参数：</strong></div>
                        <table>
                            <tbody>
                            <tr className="table-header">
                                <td><strong>参数名</strong></td>
                                <td><strong>参数类型</strong></td>
                                <td><strong>参数说明</strong></td>
                            </tr>
                            {
                                interfaceIns.paramTable ? interfaceIns.paramTable.map((item, index) => {
                                    return (<tr key={`json${index}`}>
                                        <td><span
                                            className={"level-" + item.indent}>{item.paramName ? item.paramName : '-'}</span>
                                        </td>
                                        <td>{item.paramType ? item.paramType : '-'}</td>
                                        <td>{item.illustration ? JSON.stringify(item.illustration) : '-'}</td>
                                    </tr>)
                                }) : null
                            }
                            </tbody>
                        </table>

                    </div>
                    {/*接口返回参数*/}
                    <div className="interface-ins-item">

                        <div style={{marginBottom: 5}}><strong>输出参数：</strong></div>
                        <table>
                            <tbody>
                            <tr className="table-header">
                                <td><strong>参数名</strong></td>
                                <td><strong>参数类型</strong></td>
                                <td><strong>参数说明</strong></td>
                            </tr>
                            {
                                interfaceIns.jsonTable ? interfaceIns.jsonTable.map((item, index) => {
                                    return (<tr key={`json${index}`}>
                                        <td><span
                                            className={"level-" + item.indent}>{item.paramName ? item.paramName : '-'}</span>
                                        </td>
                                        <td>{item.paramType ? item.paramType : '-'}</td>
                                        <td>{item.illustration ? JSON.stringify(item.illustration) : '-'}</td>
                                    </tr>)
                                }) : null
                            }
                            </tbody>
                        </table>

                    </div>
                    {/*返回值实例*/}
                    <div className="interface-ins-item">

                        {
                            <JsonDemo jsonStr={interfaceIns.json}/>
                        }

                    </div>
                </div>
            ) : (
                <div id={`${this.props.id}`} style={{marginBottom: 33}}>
                    {/*接口描述*/}
                    <div className="interface-ins-item" style={{fontSize: 18}}>
                        <strong>{index + ' '}</strong>
                        <strong>
                            <span>{interfaceIns.moduleName}</span>
                            <span>
                                        {
                                            interfaceIns.description ?
                                                <span style={{
                                                    color: 'rgba(0,0,0,.65)',
                                                    cursor: 'default',
                                                    border: 'none',
                                                    fontSize: 13,
                                                    backgroundColor: '#fff',
                                                    resize: 'none'
                                                }}>({interfaceIns.description})</span>
                                                :
                                                <span style={{
                                                    color: 'rgba(0,0,0,.65)',
                                                    fontSize: 13
                                                }}>(写文档的人很懒没有写模块描述哦)</span>
                                        }
                                    </span>
                        </strong>
                    </div>
                </div>
            )
        )
    }

}

export default InterfaceIns;