/**
 * Created by therfaint- on 02/08/2017.
 */
import dataParser from './Data_Parser';

const DP = new dataParser();

class JsonFormatter {

    constructor() {
        this.count = 0;
    }

    getPropByKey = (key, obj) => {
        return obj[key];
    };

    mapIllustration = (ret, prevTree) => {

        let res;

        if (!prevTree) {
            return ret;
        }

        res = ret.map(item => {
            if (item.hasOwnProperty('children')) {
                item.illustration = item.paramName === 'THIS_iS_ARRAY_TYPE' ? (prevTree[0].__TDIMDESC) : (prevTree[item.paramName] ? prevTree[item.paramName].__TDIMDESC || '' : '');
                // recurse
                item.children = this.mapIllustration(item.children, this.getPropByKey(item.paramName === 'THIS_iS_ARRAY_TYPE' ? 0 : item.paramName, prevTree));
            } else {
                if(item.paramName === 'THIS_iS_ARRAY_TYPE'){
                    item.illustration = prevTree[0];
                }else{
                    // 正常情况
                    item.illustration = prevTree[item.paramName] ? prevTree[item.paramName] : '';
                }
            }
            return item;
        });

        return res;
    };

    // 将输入的json同步至编辑器
    updateJsonToTable(inputVal, tableVal) {
        this.count = 0;
        if (!inputVal) {
            return [{
                key: '',
                paramName: '',
                paramType: [],
                usrDefine: '',
                illustration: '',
                path: ''
            }];
        }
        let d, updateStatus = true, ret;
        try {
            d = JSON.parse(this.toJsonStr(inputVal));
        } catch (e) {
            updateStatus = false;
        }
        if (updateStatus) {
            let prevTree = null;
            if (tableVal && tableVal.length) {
                prevTree = DP.getIllustrationMap(tableVal);
            }
            // 构建新的TableData对象
            ret = this.toTableDS(d);
            if (ret.length === 0) {
                return tableVal;
            } else {
                ret = this.mapIllustration(ret, prevTree);
            }
        } else {
            // rollback
            ret = tableVal;
        }
        return ret;
    }

    // 转为Table的数据结构
    toTableDS(data, originPath) {
        let dsModel = {
            key: '',
            paramName: '',
            paramType: [],
            usrDefine: '',
            illustration: '',
            path: ''
        };
        let tableDs = [];
        for (let k in data) {
            let isArray;
            let dsIns = {...dsModel};
            dsIns['key'] = String(this.count);
            if (originPath) {
                dsIns['path'] = originPath + '/' + String(this.count);
            } else {
                dsIns['path'] = String(this.count);
            }
            this.count = this.count + 1;
            if (data instanceof Array) {
                isArray = true;
                dsIns['paramName'] = 'THIS_iS_ARRAY_TYPE';
            } else {
                dsIns['paramName'] = k;
            }
            if (data[k] === null) {
                dsIns['paramType'] = new Array('string');
                dsIns['usrDefine'] = '对象和属性未定义';
                tableDs.push(dsIns);
                if (isArray) {
                    return tableDs;
                }
            } else if (data[k] instanceof Array) {
                // 数组处理
                dsIns['paramType'] = ['array'];
                dsIns['usrDefine'] = `${data[k].length}`;
                dsIns['children'] = [];
                // 数组不考虑子元素类型属性不同的情况 只考虑第一个
                dsIns['children'] = this.toTableDS(data[k], dsIns['path']);
                tableDs.push(dsIns);
                if (isArray) {
                    return tableDs;
                }
            } else if (data[k] instanceof Object) {
                // 对象处理
                dsIns['paramType'] = ['object'];
                dsIns['children'] = [];
                // 数组不考虑子元素类型属性不同的情况 只考虑第一个
                dsIns['children'] = this.toTableDS(data[k], dsIns['path']);
                tableDs.push(dsIns);
                if (isArray) {
                    return tableDs;
                }
            } else {
                // 不继续递归遍历
                dsIns['paramType'] = new Array(typeof data[k]);
                dsIns['usrDefine'] = String(data[k]);
                tableDs.push(dsIns);
                if (isArray) {
                    return tableDs;
                }
            }
        }
        return tableDs;
    }

    // 将通过this.toJsonObj格式化后的格式转为Json对象
    toJsonStr(data) {
        return this.diffInputType(data, 'string');
    }

    /*
     * 递归遍历数据生成数据内部树状结构
     *
     * data: 对象或者数组
     * indent: 缩进 调用时默认初始值请设为1
     * isArray: 如果传入data为数组请将该值设为true
     */
    toJsonBody(data, indent, isArray) {
        // let result = ''; // 返回值
        // let space = ''; // 缩进长度
        // let length = this.getLength(data); // 对象的key数量或数组的长度
        // let count = 0; // 当前下标
        // for (let i = 0; i < indent; i++) {
        //     space += '\t';
        // }
        // indent++;
        // for (let key in data) {
        //     count++;
        //     if (data[key] instanceof Array) {
        //         if (/[0-9]/.test(key) && isArray) {
        //             if (count === length) {
        //                 result = result + "\n" + space + '[' + this.toJsonBody(data[key], indent, true) + '\n' + space + ']';
        //             } else {
        //                 result = result + "\n" + space + '[' + this.toJsonBody(data[key], indent, true) + '\n' + space + '],';
        //             }
        //         } else {
        //             if (count === length) {
        //                 result = result + "\n" + space + '"' + key + '"' + ': [' + this.toJsonBody(data[key], indent, true) + '\n' + space + ']';
        //             } else {
        //                 result = result + "\n" + space + '"' + key + '"' + ': [' + this.toJsonBody(data[key], indent, true) + '\n' + space + '],';
        //             }
        //         }
        //     } else if (data[key] instanceof Object) {
        //         let newKey = '';
        //         if (isArray) {
        //             newKey = '';
        //         } else {
        //             if (!/[0-9]/.test(key)) {
        //                 newKey = '"' + key + '"' + ": ";
        //             }
        //         }
        //         if (count === length) {
        //             result = result + "\n" + space + newKey + '{' + this.toJsonBody(data[key], indent) + '\n' + space + '}';
        //         } else {
        //             result = result + "\n" + space + newKey + '{' + this.toJsonBody(data[key], indent) + '\n' + space + '},';
        //         }
        //     } else {
        //         let value = '';
        //         // 当为bool值或数字时,将引号去除
        //         if (data[key] === "") {
        //             value = '""';
        //         } else if (!isNaN(Number(data[key])) || data[key] === "true" || data[key] === "false") {
        //             value = data[key];
        //         } else {
        //             value = '"' + data[key] + '"';
        //         }
        //         if (/[0-9]/.test(key) && isArray) {
        //             if (count === length) {
        //                 result += "\n" + space + value;
        //             } else {
        //                 result += "\n" + space + value + ",";
        //             }
        //         } else {
        //             if (count === length) {
        //                 result += "\n" + space + '"' + key + '"' + ": " + `${value}`;
        //             } else {
        //                 result += "\n" + space + '"' + key + '"' + ": " + `${value}` + ",";
        //             }
        //         }
        //     }
        // }
        return JSON.stringify(data, null, indent);
    }

    // 可以通过isArray或判断data类型将内容进行封装
    // 封装格式为 [] 或 {}
    toJsonObj(data) {
        return this.toJsonBody(data, 4);
    }

    // 对输入data进行区分并返回处理结果
    diffInputType(data, type) {
        let jsonObj;
        // 字符串则将不规范的JSON格式进行调整 返回JSON字符串 区别在于是否缩进
        if (type === 'string') {
            try {
                jsonObj = JSON.parse(data);
            } catch (e) {
                try {
                    jsonObj = eval('(' + this.excludeSpecial(data) + ')');
                } catch (e) {
                    return false;
                }
            }
            return JSON.stringify(jsonObj);
        } else {
            try {
                jsonObj = JSON.parse(data);
            } catch (e) {
                try {
                    jsonObj = eval('(' + this.excludeSpecial(data) + ')');
                } catch (e) {
                    return false;
                }
            }
            return this.toJsonObj(jsonObj)
        }
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
        s = s.replace(/[\b\f\n\r\t]/g, '');
        return s;
    };

    // 检查JSON格式是否合法 返回错误信息相应行记录
    isJSON(data) {
        let isJSON = true;
        try {
            eval('(' + this.excludeSpecial(data) + ')');
        } catch (e) {
            isJSON = false;
        }
        return isJSON;
    }

    // 检查输入是否为字符串
    isString(data) {
        return data ? (data.indexOf('{') === -1 && data.indexOf('[') === -1) : false;
    }

}

export default JsonFormatter;