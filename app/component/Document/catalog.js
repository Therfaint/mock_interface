/**
 * Created by therfaint- on 02/05/2018.
 */
import React from 'react';
import NavItem from './navItem';

/* 生成两级或者一级目录导航 */
export default ({isShow, moduleDiff, dataSource, cb}) => (
    <div className={ isShow ? "nav-container" : ''} ref={cb}>
        {
            dataSource.map((item, index) => {
                return <NavItem key={index} item={item} index={index} moduleDiff={moduleDiff}/>
            })
        }
    </div>

)