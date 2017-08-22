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

    // 通过递归将特定数据结构进行数据的筛选以及随机赋值
    dataSourceFill(dataSource, type) {
        let outputObj = {};
        let arrItem;
        dataSource.map((item)=>{
            if(item.hasOwnProperty('children')){
                if(item['paramType'][0] === 'array' && dataSource.length === 1 && this.count === 1 ) {
                    arrItem = this.arrayParser(item['children'], item['paramType'][1]);
                }else if(item['paramType'][0] === 'array'){
                    outputObj[item['paramName']] = this.arrayParser(item['children'], item['paramType'][1]);
                } else if(this.isDeepestLayer(item['children'])){
                    if(item['paramType'][0] === 'object') {
                        if(type === 'array')
                            arrItem = this.objectParser(item['children']);
                        else
                            outputObj[item['paramName']] = this.objectParser(item['children']);
                    }
                }else{
                    outputObj[item['paramName']] = this.dataSourceFill(item['children']);
                }
            }else{
                switch (item['paramType'][0]){
                    case 'string':
                        if(type === 'array')
                            arrItem = this.stringParser(item['paramType'][1]);
                        else
                            outputObj[item['paramName']] = this.stringParser(item['paramType'][1]);
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
        obj = this.dataSourceFill(value);
        return obj;
    };

    // 数组分析解释处理器
    arrayParser(value, total) {
        let arr = [];
        let arrItem, isPure;
        isPure = this.isPureArray(value); // 数组元素为基础类型则不进行递归提高效率
        for(let i=0;i< Number(total); i++){
            if(!isPure){
                arrItem = this.dataSourceFill(value, 'array');
                arr.push(arrItem);
            }else{
                let item = value[0];
                switch (item['paramType'][0]){
                    case 'string':
                        arr.push(this.stringParser(item['paramType'][1]));
                        break;
                    case 'number':
                        arr.push(this.numberParser(item['paramType'][1]));
                        break;
                    case 'boolean':
                        arr.push(this.booleanParser(item['paramType'][1]));
                }
            }
        }
        return arr;
    };

    // 判断是否为基础类型数据类型数组
    isPureArray(value) {
        return !(value[0]['paramType'][0] === 'object')
    }
    
}
