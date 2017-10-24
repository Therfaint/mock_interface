/**
 * Created by therfaint- on 02/08/2017.
 */

import dataParser from '../util/Data_Parser';

class JsonFormatter {

    constructor() {

    }

    // 将输入的json同步至编辑器
    updateJsonToTable(inputVal, tableVal) {
        let d, updateStatus = true, ret;
        try{
            d = JSON.parse(this.toJsonStr(inputVal));
        }catch(e){
            updateStatus = false;
        }
        if(updateStatus){
            // 构建新的TableData对象
            ret = this.toTableDS(d);
        }else{
            // rollback
            ret = tableVal;
        }
        return ret;
    }

    // 转为Table的数据结构
    toTableDS(data, originPath, count = 1){
        let dsModel = {
            key: '',
            paramName: '',
            paramType: [],
            usrDefine: '',
            illustration: '',
            path: ''
        };
        let tableDs = [];
        for(let k in data){
            let isArray;
            let dsIns = {...dsModel};
            if(originPath){
                dsIns['key'] = originPath + '/' + String(count);
                dsIns['path'] = originPath + '/' + String(count);
            }else{
                dsIns['key'] = String(count);
                dsIns['path'] = String(count);
            }

            if(data instanceof Array){
                isArray = true;
                dsIns['paramName'] = 'array';
            }else{
                dsIns['paramName'] = k;
            }

            if(data[k] instanceof Array){
                // 数组处理
                dsIns['paramType'] = ['array', String(data[k].length)];
                dsIns['usrDefine'] = `{array(${data[k].length})}`;
                dsIns['children'] = [];
                // 数组不考虑子元素类型属性不同的情况 只考虑第一个
                dsIns['children'] = this.toTableDS(data[k], dsIns['path']);
                tableDs.push(dsIns);
                if(isArray){
                    return tableDs;
                }
            }else if(data[k] instanceof Object){
                // 对象处理
                dsIns['paramType'] = ['object'];
                dsIns['children'] = [];
                // 数组不考虑子元素类型属性不同的情况 只考虑第一个
                dsIns['children'] = this.toTableDS(data[k], dsIns['path']);
                tableDs.push(dsIns);
                if(isArray){
                    return tableDs;
                }
            }else{
                // 不继续递归遍历
                dsIns['paramType'] = new Array(typeof data[k]);
                dsIns['usrDefine'] = data[k];
                tableDs.push(dsIns);
                if(isArray){
                    return tableDs;
                }
            }
            count ++;
        }
        return tableDs;
    }

    // 将通过this.toJsonObj格式化后的格式转为Json对象
    toJsonStr(data) {
        return typeof data === 'string' ? data.replace(/[\n\t\s]/g, '') : data;
    }

    /*
     * 递归遍历数据生成数据内部树状结构
     *
     * data: 对象或者数组
     * indent: 缩进 调用时默认初始值请设为1
     * isArray: 如果传入data为数组请将该值设为true
     */
    toJsonBody(data, indent, isArray) {
        let result = ''; // 返回值
        let space = ''; // 缩进长度
        let length = this.getLength(data); // 对象的key数量或数组的长度
        let count = 0; // 当前下标
        for (let i = 0; i < indent; i++) {
            space += '\t';
        }
        indent++;
        for (let key in data) {
            count++;
            if (data[key] instanceof Array) {
                if (/[0-9]/.test(key) && isArray) {
                    if (count === length) {
                        result = result + "\n" + space + '[' + this.toJsonBody(data[key], indent, true) + '\n' + space + ']';
                    } else {
                        result = result + "\n" + space + '[' + this.toJsonBody(data[key], indent, true) + '\n' + space + '],';
                    }
                } else {
                    if (count === length) {
                        result = result + "\n" + space + '"' + key + '"' + ': [' + this.toJsonBody(data[key], indent, true) + '\n' + space + ']';
                    } else {
                        result = result + "\n" + space + '"' + key + '"' + ': [' + this.toJsonBody(data[key], indent, true) + '\n' + space + '],';
                    }
                }
            } else if (data[key] instanceof Object) {
                let newKey = '';
                if (isArray) {
                    newKey = '';
                } else {
                    if (!/[0-9]/.test(key)) {
                        newKey = '"' + key + '"' + ": ";
                    }
                }
                if (count === length) {
                    result = result + "\n" + space + newKey + '{' + this.toJsonBody(data[key], indent) + '\n' + space + '}';
                } else {
                    result = result + "\n" + space + newKey + '{' + this.toJsonBody(data[key], indent) + '\n' + space + '},';
                }
            } else {
                let value = '';
                // 当为bool值或数字时,将引号去除
                if (data[key] === "") {
                    value = '""';
                } else if (!isNaN(Number(data[key])) || data[key] === "true" || data[key] === "false") {
                    value = data[key];
                } else {
                    value = '"' + data[key] + '"';
                }
                if (/[0-9]/.test(key) && isArray) {
                    if (count === length) {
                        result += "\n" + space + value;
                    } else {
                        result += "\n" + space + value + ",";
                    }
                } else {
                    if (count === length) {
                        result += "\n" + space + '"' + key + '"' + ": " + `${value}`;
                    } else {
                        result += "\n" + space + '"' + key + '"' + ": " + `${value}` + ",";
                    }
                }
            }
        }
        return result;
    }

    // 可以通过isArray或判断data类型将内容进行封装
    // 封装格式为 [] 或 {}
    toJsonObj(data, indent, isArray) {
        if (data instanceof Array)
            return "[" + this.toJsonBody(data, indent, isArray) + "\n" + "]"
        else
            return "{" + this.toJsonBody(data, indent, isArray) + "\n" + "}"
    }

    // 对输入data进行区分并返回处理结果
    diffInputType(data) {
        let formatData;
        let jsonObj;
        try {
            jsonObj = JSON.parse(data);
        } catch (e) {
            jsonObj = eval('(' + this.excludeSpecial(data) + ')');
        }
        if (jsonObj && jsonObj instanceof Array) {
            formatData = this.toJsonObj(jsonObj, 1, true);
        } else if (jsonObj && jsonObj instanceof Object) {
            formatData = this.toJsonObj(jsonObj, 1, false);
        }
        return formatData;
    }

    // 获取Array的长度或Object中key的数目
    getLength(data) {
        let count = 0;
        if (data instanceof Array) {
            count = data.length;
        } else if (data instanceof Object) {
            for (let k in data) {
                count++;
            }
        }
        return count;
    }

    excludeSpecial(s) {
        // 去掉转义字符
        s = s.replace(/[\b\f\n\r\t\s]/g, '');
        return s;
    };

    // 检查JSON格式是否合法 返回错误信息相应行记录
    isJSON(data) {
        let isJSON = true,
            errName,
            errStr,
            errMsg;
        try {
            eval('(' + this.excludeSpecial(data) + ')')
        } catch (e) {
            //     let i,
            //         index,
            //         leftOffSet = 0,
            //         leftCount = 0,
            //         rightOffSet = 0,
            //         rightCount = 0;
            //
            //     // 设置返回参数
            //     isJSON = false;
            //     errName = e.name;
            //     errMsg = e.message;
            //
            //     if (data[0] === "{" || data[0] === "[") {
            //
            //     } else {
            //         errStr = '缺少起始符 "{" 或 "["';
            //         return {isJSON, errName, errMsg, errStr};
            //     }
            //     if (data[data.length - 1] === "}" || data[data.length - 1] === "]") {
            //
            //     } else {
            //         errStr = '缺少结束符 "}" 或 "]"';
            //         return {isJSON, errName, errMsg, errStr};
            //     }
            //     i = Number(e.message.split('position ')[1]);
            //     index = Number(e.message.split('position ')[1]);
            //     while (leftCount < 2) {
            //         if (index <= leftOffSet) {
            //             return {isJSON, errName, errMsg};
            //         }
            //         if ((data.substring((index - leftOffSet), index).indexOf('\n')) === -1) {
            //             leftOffSet++;
            //         } else {
            //             leftOffSet++;
            //             leftCount++;
            //             index = index - leftOffSet;
            //         }
            //     }
            //     index = Number(e.message.split('position')[1]);
            //     while (rightCount < 1) {
            //         if ((data.substring(index, (index + rightOffSet)).indexOf("}")) !== -1) {
            //             return {isJSON, errName, errMsg};
            //         }
            //         if ((data.substring(index, (index + rightOffSet)).indexOf('\n')) === -1) {
            //             rightOffSet++;
            //         } else {
            //             rightOffSet++;
            //             rightCount++;
            //             index = index + rightOffSet;
            //         }
            //     }
            //     errStr = data.substring(i - leftOffSet, i + rightOffSet);
            // }
        }
        return {isJSON, errName, errMsg, errStr};
    }

    // 检查输入是否为字符串
    isString(data) {
        return data ? (data.indexOf('{') === -1 && data.indexOf('[') === -1) : false;
    }

}

export default JsonFormatter;