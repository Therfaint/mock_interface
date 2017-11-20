/**
 * Created by therfaint- on 30/10/2017.
 */
import React from 'react';
import Input from 'antd/lib/input';
import JsonDemo from './jsonDemo';
import Tooltip from 'antd/lib/tooltip';
import Icon from 'antd/lib/icon';

class InterfaceIns extends React.Component{

    render(){

        // todo: 根据type区分为目录或接口文档进行相应渲染

        const {interfaceIns, index, copyUrl, type} = {...this.props};

        return(

            <div>
                {
                    type !== 1 ? (
                        <div id={`${this.props.id}`} style={type === 2 ? {marginBottom: 20, paddingLeft: 25} : {marginBottom: 20}}>
                            {/*接口描述*/}
                            <div className="interface-ins-item">
                                <strong>{ type === 2 ? (index + ' ') : (index + '.')}</strong>
                                <strong>{interfaceIns.description}</strong>
                            </div>
                            {/*接口路径*/}
                            <div className="interface-ins-item">
                                <strong>
                                    <span>接口路径：</span>
                                    <Tooltip overlay={<span>点我复制接口链接</span>}><a onClick={(e)=>copyUrl(e)}>{interfaceIns.url}</a></Tooltip>
                                </strong>
                            </div>
                            {/*接口请求方法*/}
                            <div className="interface-ins-item">
                                <strong><span>请求方式：</span>{interfaceIns.method}</strong>
                            </div>
                            {/*接口入参*/}
                            <div className="interface-ins-item">

                                <div style={{marginBottom:5}}><strong>输入参数：</strong></div>
                                <table>
                                    <tbody>
                                    <tr className="table-header">
                                        <td><strong>参数名</strong></td>
                                        <td><strong>参数类型</strong></td>
                                        <td><strong>参数说明</strong></td>
                                    </tr>
                                    {
                                        interfaceIns.paramTable ? interfaceIns.paramTable.map((item,index)=>{
                                            return (<tr key={`json${index}`}>
                                                <td><span className={"level-"+item.indent}>{item.paramName ? item.paramName : '-'}</span></td>
                                                <td>{item.paramType ? item.paramType : '-'}</td>
                                                <td>{item.illustration ? item.illustration : '-'}</td>
                                            </tr>)
                                        }) : null
                                    }
                                    </tbody>
                                </table>

                            </div>
                            {/*接口返回参数*/}
                            <div className="interface-ins-item">

                                <div style={{marginBottom:5}}><strong>输出参数：</strong></div>
                                <table>
                                    <tbody>
                                    <tr className="table-header">
                                        <td><strong>参数名</strong></td>
                                        <td><strong>参数类型</strong></td>
                                        <td><strong>参数说明</strong></td>
                                    </tr>
                                    {
                                        interfaceIns.jsonTable ? interfaceIns.jsonTable.map((item,index)=>{
                                            return (<tr key={`json${index}`}>
                                                <td><span className={"level-"+item.indent}>{item.paramName ? item.paramName : '-'}</span></td>
                                                <td>{item.paramType ? item.paramType : '-'}</td>
                                                <td>{item.illustration ? item.illustration : '-'}</td>
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
                        <div id={`${this.props.id}`} style={{marginBottom: 9}}>
                            {/*接口描述*/}
                            <div className="interface-ins-item" style={{fontSize: 18}}>
                                <strong>{index + ' '}</strong>
                                <strong>{interfaceIns.moduleName}</strong>
                                <div style={{paddingLeft: 18, marginTop: 9}}>
                                    {
                                        interfaceIns.description ?
                                            <Input value={interfaceIns.description} style={{ color:'rgba(0,0,0,.65)', cursor: 'default',border: 'none',fontSize: 16, backgroundColor: '#fff', resize:'none'}} autosize={{minRows:1}} type="textarea" disabled/>
                                            :
                                            <div style={{paddingLeft: 7}}><Icon type="frown-o"/> 写文档的人很懒没有写模块描述哦 </div>
                                    }
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }

}

export default InterfaceIns;