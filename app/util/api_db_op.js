/**
 * Created by therfaint- on 01/08/2017.
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

module.exports = class apiDbUtil{

    constructor(){

        this.conn = mongoose.createConnection('mongodb://127.0.0.1:27017/api', options);

        this.conn.on('error', function(error){
            console.log('数据库连接失败!\n' + error);
        });

        this.conn.once('open',function(error){
            if(error){
                console.log('数据库连接失败!\n' + error);
            }
            console.log('数据库连接成功...');
        });

        // todo: 是否新增ref或者进行多表查询

        this.apiSchema = new mongoose.Schema({
            url: {
                type: String,
                required: true
            },
            param: {
                type: mongoose.Schema.Types.Mixed
            },
            paramTable: {
                type: mongoose.Schema.Types.Mixed
            },
            description: {
                type: String,
                required: true
            },
            method: {
                type: String,
                required: true
            },
            createTime: {
                type: String,
                required: true
            },
            json: {
                type: mongoose.Schema.Types.Mixed,
                required: true
            },
            jsonTable: {
                type: mongoose.Schema.Types.Mixed,
                required: true
            },
            refProId:{
                type: String,
                index: true
            },
            refModuleId:{
                type: String,
                index: true
            }
        });
        this.API = this.conn.model('api', this.apiSchema);
    }

    add(apiObj, callback){
        let apiInstance = new this.API(apiObj);
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

    batchAdd(apiArr, proCode, type, moduleId, callback){

        let bool = true;

        if(type === 'module'){
            apiArr.map(item=>{
                this.update(item._id, {refModuleId: proCode}, function (status) {
                    if (status.code === 500) {
                        bool = false;
                    }
                })
            });
        }else{
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
                obj['createTime'] = item.createTime;
                obj['refProId'] = item.refProId;
                obj['refModuleId'] = moduleId;
                obj['lastUpdateTime'] = item.lastUpdateTime ? item.lastUpdateTime : item.createTime;
                this.add(obj, function (status) {
                    if (status.code === 500) {
                        bool = false;
                    }
                })
            });
        }
        if(bool){
            callback(true);
        }else{
            callback(false);
        }
    }

    deleteById(id, callback){
        this.API.remove({_id: id}, function (err,result) {
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
        this.API.update({_id: id}, update, function (err,result) {
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
            // selectParam = {url: url, method: type, param: data};
            selectParam = {url: url, method: type};
        else
            selectParam = {url: url, method: type};
        this.API.find(selectParam, {json: 1, param: 1}, function (err,result) {
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
        this.API.find({url: reg},function (err,result) {
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
        this.API.find({}, {}, {sort: {'createTime': -1}}, function (err,result) {
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
        this.API.find({refProId: id}, function(err,result){
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                console.log('关联接口查询成功!');
                callback(status.success, result);
            }
        })
    }

    getAllByModuleId(id, callback){
        this.API.find({refModuleId: id}, function(err,result){
            if(err){
                callback({})
            }else{
                callback(result);
            }
        })
    }

    importAPIs(proId, apiArr, callback){
        this.API.find({ _id: { $in: apiArr }}, function (err,result) {
            if(err){
                callback(false, err);
            }else{
                result.map(item=>{
                    item.refProId = proId;
                });
                callback(true, result);
            }
        })
    }

};