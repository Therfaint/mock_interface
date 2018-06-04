/**
 * Created by therfaint- on 18/08/2017.
 */
import Mock from 'mockjs';

const defaultStr = 'Hello World';
const defaultNum = 666;
const defaultBool = true;

export default class Data_Parser {

    // 判断是对象还是数组
    isArray(dataSource) {
        let isArray = false;
        if (dataSource.length === 1 && dataSource[0]['paramType'][0] === 'array') {
            isArray = true;
        }
        return isArray;
    }

    // 对usrDefine数据进行处理 在为数组长度设置时默认替换原数据的类型和长度
    /**
     @param {String} [input] 输入的字符串
     @param {Object} [item] table结构中的每一条数据
     @return {String | null} isArr === false ? 返回执行函数的值 : 不返回
     */
    handleUsrDef = (input, item) => {
        if(input[0] === '@'){
            let reg = new RegExp(/^@.*\(.*\)$/);
            return reg.exec(input) ? Mock.mock(input) || typeof Mock.mock(input) === 'boolean' ? Mock.mock(input) : '' : input;
        }else{
            if (item['paramType'][0] !== 'array' && item['paramType'][0] !== 'object') {
                if (input === 'true' || input === 'false') {
                    item['paramType'] = ['boolean'];
                    input = input === 'true';
                } else if (!isNaN(Number(input))) {
                    item['paramType'] = ['number'];
                    input = Number(input);
                } else {
                    item['paramType'] = [typeof input];
                }
                return input;
            }
        }
    };

    // 通过递归将特定数据结构进行数据的筛选以及随机赋值
    /**
     @param {Array} [dataSource] 进行遍历填充的table对象
     @param {String} [type] object : array
     @return {Object | Array} [arrItem | outputObj] object: 返回{key:val}, array: 返回[val,val,val]
     */
    dataSourceFill(dataSource, type = 'object') {
        let outputObj = {};
        let arrItem;
        dataSource.map((item) => {
            if (item.hasOwnProperty('children')) {
                // 数组+数组
                if (item['paramType'][0] === 'array' && type === 'array') {
                    arrItem = this.arrayParser(item['children'], item['usrDefine']);
                    // 数组+对象
                } else if (item['paramType'][0] === 'object' && type === 'array') {
                    arrItem = this.objectParser(item['children']);
                    // 对象+数组
                } else if (item['paramType'][0] === 'array' && type === 'object') {
                    outputObj[item['paramName']] = this.arrayParser(item['children'], item['usrDefine']);
                    // 对象+对象
                } else if (item['paramType'][0] === 'object' && type === 'object') {
                    outputObj[item['paramName']] = this.dataSourceFill(item['children']);
                }
            } else {
                // 最外层递归赋值
                if (item.hasOwnProperty('usrDefine') && item['usrDefine']) {
                    if (type === 'array'){
                        arrItem = this.handleUsrDef(item['usrDefine'], item);
                    } else{
                        outputObj[item['paramName']] = this.handleUsrDef(item['usrDefine'], item);
                    }
                } else {
                    switch (item['paramType'][0]) {
                        case 'string':
                            if (type === 'array'){
                                arrItem = this.stringParser(item['usrDefine']);
                            } else{
                                outputObj[item['paramName']] = this.stringParser(item['usrDefine']);
                            }
                            break;
                        case 'number':
                            if (type === 'array'){
                                arrItem = this.numberParser(item['usrDefine']);
                            }else{
                                outputObj[item['paramName']] = this.numberParser(item['usrDefine']);
                            }
                            break;
                        case 'boolean':
                            if (type === 'array'){
                                arrItem = this.booleanParser(item['usrDefine']);
                            }else{
                                outputObj[item['paramName']] = this.booleanParser(item['usrDefine']);
                            }
                            break;
                        default:
                            console.log('Parse Error');
                            break;
                    }
                }
            }
        });
        return arrItem !== undefined ? arrItem : outputObj;
    };

    // 是否拥有下层子节点
    // 在拥有的情况下则不进行对象的解析 继续进行递归
    /**
     @param {Object} [source] 进行判断的对象
     @return {boolean} [isExist] 是否为最底层节点
     */
    isDeepestLayer(source) {
        let isExist = true;
        source.map(item => {
            if (item.hasOwnProperty('children')) {
                isExist = false;
            }
        });
        return isExist;
    };

    // 字符串分析解释处理器
    stringParser(value) {
        return value ? Mock.mock(value) : 'Hello World';
    };

    // 字符串分析解释处理器
    numberParser(value) {
        if (value) {
            Mock.mock(value);
        } else {
            return 666;
        }
    };

    // 布尔值分析解释处理器
    booleanParser(value) {
        return value ? Mock.mock(value) : true;
    };

    // 对象分析解释处理器
    objectParser(value) {
        let obj;
        if (value[0].paramName === 'THIS_iS_ARRAY_TYPE' && value[0].paramType[0] === 'object') {
            obj = this.dataSourceFill(value, 'array');
        } else {
            obj = this.dataSourceFill(value);
        }
        return obj;
    };

    // 数组分析解释处理器
    /**
     @param {Object} [value] 进行遍历填充的对象
     @param {Number | String} [total] 填充数组长度
     @return {Array} [arr] object: 返回{key:val}, array: 返回[val,val,val]
     */
    arrayParser(value, total) {
        let arr = [],
            arrItem;
        let paramType = this.isPureArray(value); // 数组元素为基础类型则不进行递归提高效率
        for (let i = 0; i < Number(total); i++) {
            switch (paramType) {
                case 'none':
                    break;
                case 'array':
                    arrItem = this.dataSourceFill(value, 'array');
                    arr.push(arrItem);
                    break;
                case 'object':
                    arr.push(this.objectParser(value));
                    break;
                default:
                    let item = value[0];
                    if (item.hasOwnProperty('usrDefine') && item['usrDefine']) {
                        arr.push(this.handleUsrDef(item['usrDefine'], {paramType: ['arrayItem']}));
                    } else {
                        switch (item['paramType'][0]) {
                            case 'string':
                                arr.push(defaultStr);
                                break;
                            case 'number':
                                arr.push(defaultNum);
                                break;
                            case 'boolean':
                                arr.push(defaultBool);
                                break;
                        }
                    }
                    break;
            }
        }
        // }
        return arr;
    };

    // 判断是否为基础类型数据类型数组
    isPureArray(value) {
        return value.length ? value[0]['paramType'][0] : 'none';
    }

}
