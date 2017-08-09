/**
 * Created by therfaint- on 01/08/2017.
 */
var mongoose = require('mongoose');
var status = require('./DB_Op_Status');

mongoose.Promise = global.Promise;

module.exports = class dbUtils{

    constructor(){
        this.conn = mongoose.createConnection('mongodb://127.0.0.1:27017/api');

        this.conn.on('error', function(error){
            console.log('数据库连接失败!\n' + error);
        });

        this.conn.on('open',function(error){
            if(error){
                console.log('数据库连接失败!\n' + error);
            }
            console.log('数据库连接成功...');
        });

        this.apiSchema = new mongoose.Schema({
            url: {
                type: String,
                required: true
            },
            param: {
                type: mongoose.Schema.Types.Mixed
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
            }
        })
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
            selectParam = {url: url, method: type, param: data};
        else
            selectParam = {url: url, method: type}
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

    queryByParams(param, callback){
        var reg = new RegExp(param);
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

}