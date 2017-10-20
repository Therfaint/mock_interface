/**
 * Created by therfaint- on 18/08/2017.
 */
import stringOpts from './Parser_Options';
import r from './Random'

export default class Data_Parser{
    
    constructor(){
        this.count = 1;
    }

    // 判断是对象还是数组
    isArray(dataSource) {
        let isArray = false;
        if(dataSource.length === 1 && dataSource[0]['paramType'][0] === 'array'){
            isArray = true;
        }
        return isArray;
    }

    // 对usrDefine数据进行处理
    handleUsrDef = (input, item) => {
        let reg = new RegExp(/^{{[0-9a-zA-Z]*\([0-9a-zA-Z]*\)}}$/);
        if(reg.test(input)){
            // 判断是否是array情况
            // 修改item的paramType

            // 函数处理
            console.log('function');
        }else{
            // 数据处理
            console.log('base')
        }
    };

    // 通过递归将特定数据结构进行数据的筛选以及随机赋值
    dataSourceFill(dataSource, type = 'object') {
        let outputObj = {};
        let arrItem, usrDefStatus; //可以用来判断 是输入还是函数
        dataSource.map((item)=>{
            // 进行判断
            // 1.输入:
            // 2.函数:
            // 2.1 数组下标的情况 修改paramType数组进行设置 直接修改item字段
            // 2.2 正常函数返回
            this.handleUsrDef(item['usrDefine'], item);
            if(item.hasOwnProperty('children')){
                // 数组+数组
                if(item['paramType'][0] === 'array' && type === 'array') {
                    arrItem = this.arrayParser(item['children'], item['paramType'][1]);
                // 数组+对象
                }else if(item['paramType'][0] === 'object' && type === 'array'){
                    arrItem = this.objectParser(item['children']);
                // 对象+数组
                }else if(item['paramType'][0] === 'array' && type === 'object'){
                    outputObj[item['paramName']] = this.arrayParser(item['children'], item['paramType'][1]);
                // 对象+对象
                }else if(item['paramType'][0] === 'object' && type === 'object'){
                    outputObj[item['paramName']] = this.dataSourceFill(item['children']);
                }
            }else{
                //判断自定义的输入 是否是函数形式 通过正则
                //这里可以用函数的方式进行操作。根据函数的返回值赋值 注意情况判断 1.函数 2.字符串
                if(item.hasOwnProperty('usrDefine') && item['usrDefine']){
                    if(type === 'array')
                        arrItem = item['usrDefine'];
                    else
                        outputObj[item['paramName']] = item['usrDefine'];
                }else{
                    switch (item['paramType'][0]){
                        case 'string':
                            if(type === 'array')
                                arrItem = item['usrDefine'];
                            else
                                outputObj[item['paramName']] = item['usrDefine'];
                            break;
                        case 'number':
                            if(type === 'array')
                                arrItem = this.numberParser(item['paramType'][1]);
                            else
                                outputObj[item['paramName']] = this.numberParser(item['paramType'][1]);
                            break;
                        case 'boolean':
                            if(type === 'array')
                                arrItem = this.booleanParser(item['paramType'][1]);
                            else
                                outputObj[item['paramName']] = this.booleanParser(item['paramType'][1]);
                            break;
                        default: console.log('Parse Error');break;
                    }
                }
            }
        });
        this.count ++;
        return arrItem !== undefined ? arrItem : outputObj;
    };

    // 是否拥有下层子节点
    // 在拥有的情况下则不进行对象的解析 继续进行递归
    isDeepestLayer(source) {
        let isExist = true;
        source.map(item=>{
            if(item.hasOwnProperty('children')){
                isExist = false;
            }
        });
        return isExist;
    };

    // 字符串分析解释处理器
    stringParser(value) {
        if(value === "@string")
            return "请输入(字符串)";
        return stringOpts[value]();
    };

    // 字符串分析解释处理器
    numberParser(value) {
        if(value === "@number"){
            return '请输入(数字)';
        }
        if(value.indexOf('-') === -1){
            return Number(value);
        }else{
            let min, max;
            min = value.split('-')[0];
            max = value.split('-')[1];
            if(value.charAt(0) === '.')
                return r.getFloatRandomByRange(min, max)
            else
                return r.getIntRandomByRange(min, max);
        }
    };

    // 布尔值分析解释处理器
    booleanParser(value) {
        return value === '@boolean' ? Boolean(r.getInt021()) : value;
    };

    // 对象分析解释处理器
    objectParser(value) {
        let obj;
        if(value[0].paramName === 'array' && value[0].paramType[0] === 'object'){
            obj = this.dataSourceFill(value, 'array');
        }else{
            obj = this.dataSourceFill(value);
        }
        return obj;
    };

    // 数组分析解释处理器
    arrayParser(value, total) {
        debugger;
        // todo: 数组的用户定义类型也需要设置
        let arr = [];
        let arrItem, isPure;
        let paramType = this.isPureArray(value); // 数组元素为基础类型则不进行递归提高效率
        for(let i=0;i< Number(total); i++) {
            switch (paramType) {
                case 'array':
                    arrItem = this.dataSourceFill(value, 'array');
                    arr.push(arrItem);
                    break;
                case 'object':
                    arr.push(this.objectParser(value));
                    break;
                default:
                    let item = value[0];
                    // if(item.hasOwnProperty('usrDefine') && item['usrDefine']){
                    //     arr.push(item['usrDefine']);
                    // }else{
                        switch (item['paramType'][0]) {
                            case 'string':
                                arr.push(this.stringParser(item['paramType'][1]));
                                break;
                            case 'number':
                                arr.push(this.numberParser(item['paramType'][1]));
                                break;
                            case 'boolean':
                                arr.push(this.booleanParser(item['paramType'][1]));
                                break;
                        }
                    // }
                    break;
            }
        }
        return arr;
    };

    // 判断是否为基础类型数据类型数组
    isPureArray(value) {
        return value[0]['paramType'][0];
    }
    
}
