/**
 * Created by therfaint- on 08/11/2017.
 */
let mongoose = require('mongoose');
let status = require('./DB_Op_Status');

mongoose.Promise = global.Promise;

const options = {
    server: {
        auto_reconnect: true,
        poolSize: 10
    }
};

module.exports = class opLogDbUtil{

    constructor(){

        this.conn = mongoose.createConnection('mongodb://127.0.0.1:27017/op_history', options);

        this.conn.on('error', function(error){
            console.log('数据库连接失败!\n' + error);
        });

        this.conn.once('open',function(error){
            if(error){
                console.log('数据库连接失败!\n' + error);
            }
            console.log('数据库连接成功...');
        });

        // todo: 如果加入模块可能字段就不一样了

        this.opHistorySchema = new mongoose.Schema({
            refApiId:{
                type: String,
                index: true
            },
            opTime: {
                type: String,
                required: true
            },
            opUser: {
                type: String
            },
            refApis: {
                type: Array
            },
        });
        this.His = this.conn.model('op_history', this.opHistorySchema);
    }

    add(apiObj, callback){
        let apiInstance = new this.His(apiObj);
        apiInstance.save(function (err, result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                console.log(apiObj.url + ' 添加成功!');
                callback(status.success);
            }
        });
    }

    batchAdd(apiArr, proCode, callback){
        let bool = true;
        apiArr.map(item=>{
            let obj = {};
            let urlArr = item.url.split('/');
            urlArr[1] = proCode;
            obj['url'] = urlArr.join('/');
            obj['param'] = item.param;
            obj['paramTable'] = item.paramTable;
            obj['method'] = item.method;
            obj['json'] = item.json;
            obj['jsonTable'] = item.jsonTable;
            obj['description'] = item.description;
            obj['refProId'] = item.refProId;
            obj['createTime'] = item.createTime;
            obj['lastUpdateTime'] = item.lastUpdateTime ? item.lastUpdateTime : item.createTime;
            this.add(obj, function (status) {
                if (status.code === 500) {
                    bool = false;
                }
            })
        });
        if(bool){
            callback(true);
        }else{
            callback(false);
        }
    }

    deleteById(id, callback){
        this.His.remove({_id: id}, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                console.log('_id: '+ id +' 删除成功!');
                callback(status.success, result);
            }
        })
    }

    update(id, param, callback){
        let update = {$set : param};
        this.His.update({_id: id}, update, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                console.log('_id: '+ id +' 更新成功!');
                callback(status.success, result);
            }
        })
    }

    getAPI(url, type, data, callback){
        let selectParam;
        if(type === 'POST')
            selectParam = {url: url, method: type, param: data};
        else
            selectParam = {url: url, method: type};
        this.His.find(selectParam, {json: 1, param: 1}, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                console.log('请求: '+ url +' 返回成功!');
                callback(status.success, result);
            }
        })
    }

    queryByParams(param, proCode, callback){
        let reg = new RegExp(`/${proCode}/${param}`);
        this.His.find({url: reg},function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                console.log('模糊查询 url: '+ param +' 查询成功!');
                callback(status.success, result);
            }
        })
    }

    selectAll(callback){
        this.His.find({}, {}, {sort: {'createTime': -1}}, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                console.log('全部数据查询成功!');
                callback(status.success, result);
            }
        })
    }

    getAllById(id, callback){
        this.His.find({refProId: id}, function(err,result){
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                console.log('关联接口查询成功!');
                callback(status.success, result);
            }
        })
    }

    importAPIs(proId, apiArr, callback){
        this.His.find({ _id: { $in: apiArr }}, function (err,result) {
            if(err){
                callback(false, err);
            }else{
                result.map(item=>{
                    delete item._id;
                    item.refProId = proId;
                });
                callback(true, result);
            }
        })
    }

};