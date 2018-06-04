/**
 * Created by therfaint- on 02/05/2018.
 */
import React, {Component} from 'react';
import Icon from 'antd/lib/icon';

/* 生成两级或者一级目录导航 */
export default class NavItem extends Component{

    constructor(props){
        super(props);
        this.state = {
            expand: false
        }
    }

    expandChild = (e) => {
        let tar = e.target;
        if(tar.tagName !== 'A'){
            tar = tar.parentNode;
        }
        let visible = !this.state.expand;
        this.getSiblings(tar.parentNode, visible);
        this.setState({
            expand: visible
        })
    };

    getSiblings = (start, visible) => {
        let nextSibling = start.nextSibling;
        if(!nextSibling || nextSibling.childNodes.length === 0){
            return;
        }
        let childNode = nextSibling.childNodes[0];
        let isChild = childNode.classList.contains('catalog-2');
        if(isChild && nextSibling){
            childNode.style.display = visible ? 'block' : 'none';
            this.getSiblings(nextSibling, visible);
        }
    };

    render(){

        const {expand} = this.state;
        const {item, index, moduleDiff} = this.props;

        return(
            moduleDiff ?
                <div key={`navTo-${index}`} className="nav-item-container">
                    {
                        item.type >> 0 === 1 ?
                            <a className={"nav_interface catalog-" + item.type} onClick={this.expandChild}><Icon type={expand ? 'down' : 'right'} style={{marginRight:3}}/>{`${item.order} ${item.moduleName ? item.moduleName : item.description}`}</a>
                            :
                            <a className={"nav_interface prefix catalog-" + item.type} style={{display: 'none'}}
                               href={`#interface-${item.key}`}>{`${item.order} ${item.moduleName ? item.moduleName : item.description}`}</a>
                    }
                </div>
                :
                <div key={`navTo-${index}`} className="nav-item-container">
                    <a className="nav_interface prefix"
                       href={`#interface-${item.key}`}>{item.description}</a>
                </div>
        )

    }

}