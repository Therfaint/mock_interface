/**
 * Created by therfaint- on 02/08/2017.
 */

class JsonFormatter{

    constructor(){

    }

    // 将通过this.toJsonObj格式化后的格式转为Json对象
    toJsonStr(data){
        return typeof data === 'string' ? data.replace(/[\n\t\s]/g, '') : data;
    }

    /*
     * 递归遍历数据生成数据内部树状结构
     *
     * data: 对象或者数组
     * indent: 缩进 调用时默认初始值请设为1
     * isArray: 如果传入data为数组请将该值设为true
     */
    toJsonBody(data, indent, isArray){
        let result = ''; // 返回值
        let space = ''; // 缩进长度
        let length = this.getLength(data); // 对象的key数量或数组的长度
        let count = 0; // 当前下标
        for (let i=0;i< indent;i++){
            space += '\t';
        }
        indent ++;
        for(let key in data){
            count ++;
            if(data[key] instanceof Array){
                if(count === length){
                    result = result + "\n" + space + '"' + key + '"' + ': [' + this.toJsonBody(data[key], indent, true) + '\n' + space +']';
                }else{
                    result = result + "\n" + space + '"' + key + '"' + ': [' + this.toJsonBody(data[key], indent, true) + '\n' + space +'],';
                }
            }else if(data[key] instanceof Object){
                let newKey = '';
                if(isArray){
                    newKey = '';
                }else{
                    if(!/[0-9]/.test(key)){
                        newKey = '"' + key + '"' + ": ";
                    }
                }
                if(count === length){
                    result = result + "\n" + space + newKey + '{' + this.toJsonBody(data[key], indent) + '\n' + space +'}';
                }else{
                    result = result + "\n" + space + newKey + '{' + this.toJsonBody(data[key], indent) + '\n' + space +'},';
                }
            }else {
                let value = '';
                // 当为bool值或数字时,将引号去除
                if(!isNaN(Number(data[key])) || data[key] === "true" || data[key] === "false"){
                    value = data[key]
                }else{
                    value = '"' + data[key] + '"';
                }
                if(/[0-9]/.test(key)){
                    if(count === length){
                        result += "\n" + space + value;
                    }else{
                        result += "\n" + space + value + ",";
                    }
                }else{
                    if(count === length){
                        result += "\n" + space + '"' + key + '"' +  ": " + value;
                    }else{
                        result += "\n" + space + '"' + key + '"' +  ": " + value + ",";
                    }
                }
            }
        }
        return result;
    }

    // 可以通过isArray或判断data类型将内容进行封装
    // 封装格式为 [] 或 {}
    toJsonObj(data, indent, isArray){
        if(data instanceof Array)
            return "[" + this.toJsonBody(data, indent, isArray) + "\n" + "]"
        else
            return "{" + this.toJsonBody(data, indent, isArray) + "\n" + "}"
    }

    // 对输入data进行区分并返回处理结果
    diffInputType(data){
        let formatData;
        let jsonObj = JSON.parse(data);
        if(jsonObj && jsonObj instanceof Array){
            formatData = this.toJsonObj(jsonObj, 1, true);
        }else if(jsonObj && jsonObj instanceof Object){
            formatData = this.toJsonObj(jsonObj, 1, false);
        }
        return formatData;
    }

    // 获取Array的长度或Object中key的数目
    getLength(data){
        let count = 0;
        if(data instanceof Array){
            count = data.length;
        }else if(data instanceof Object){
            for(let k in data){
                count ++;
            }
        }
        return count;
    }

    // 检查JSON格式是否合法 返回错误信息相应行记录
    isJSON(data){
        let isJSON = true,
            errName,
            errStr,
            errMsg;
        try {
            JSON.parse(data);
        }catch (e){
            let i,
                index,
                leftOffSet = 0,
                leftCount = 0,
                rightOffSet = 0,
                rightCount = 0;

            // 设置返回参数
            isJSON = false;
            errName = e.name;
            errMsg = e.message;

            if(data[0] === "{" || data[0] === "["){

            }else{
                errStr = '缺少起始符 "{" 或 "["';
                return { isJSON, errName, errMsg, errStr };
            }
            if(data[data.length-1] === "}" || data[data.length-1] === "]"){

            }else{
                errStr = '缺少结束符 "}" 或 "]"';
                return { isJSON, errName, errMsg, errStr };
            }
            i = Number(e.message.split('position ')[1]);
            index = Number(e.message.split('position ')[1]);
            while(leftCount < 2){
                if(index <= leftOffSet){
                    return { isJSON, errName, errMsg };
                }
                if((data.substring((index - leftOffSet), index).indexOf('\n')) === -1){
                    leftOffSet ++;
                }else{
                    leftOffSet ++;
                    leftCount ++;
                    index = index - leftOffSet;
                }
            }
            index = Number(e.message.split('position')[1]);
            while(rightCount < 1){
                if((data.substring(index, (index + rightOffSet)).indexOf("}")) !== -1){
                    return { isJSON, errName, errMsg };
                }
                if((data.substring(index, (index + rightOffSet)).indexOf('\n')) === -1){
                    rightOffSet ++;
                }else{
                    rightOffSet ++;
                    rightCount ++;
                    index = index + rightOffSet;
                }
            }
            errStr = data.substring(i-leftOffSet, i+rightOffSet);
        }
        return { isJSON, errName, errMsg, errStr };
    }

    // 检查输入是否为字符串
    isString(data){
        return (data.indexOf('{') === -1 && data.indexOf('[') === -1)
    }

}

export default JsonFormatter;