/**
 * Created by therfaint- on 23/08/2017.
 */

let mongoose = require('mongoose');
let status = require('../util/DB_Op_Status');
let apiDbUtil = require('./api_db_op');

mongoose.Promise = global.Promise;

const options = {
    server: {
        auto_reconnect: true,
        poolSize: 10
    }
};

module.exports = class proDbUtil{

    constructor(){

        this.conn = mongoose.createConnection('mongodb://127.0.0.1:27017/project', options);

        this.conn.on('error', function(error){
            console.log('数据库连接失败!\n' + error);
        });

        this.conn.on('open',function(error){
            if(error){
                console.log('数据库连接失败!\n' + error);
            }
            console.log('数据库连接成功...');
        });

        this.proSchema = new mongoose.Schema({
            projectCode: {
                type: String
            },
            projectName: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            createTime: {
                type: String,
                required: true
            },
            lastUpdateTime: {
                type: String,
                required: true
            },
            createBy:{
                type: String
            },
            tag: {
                type: Boolean,
                default: false,
            }
        });

        this.PRO = this.conn.model('pro', this.proSchema);
    }

    add(proObj, callback){
        let proInstance = new this.PRO(proObj);
        proInstance.save(function (err, result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success, result);
            }
        });
    }

    // 批量删除
    deleteById(id, callback){
        this.PRO.remove({_id: id}, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success, result);
            }
        })
    }

    update(id, param, callback){
        let update = {$set : param};
        this.PRO.update({_id: id}, update, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success, result);
            }
        })
    }

    updateLastUpdateTime(id, time){
        let update = {lastUpdateTime : time};
        this.PRO.update({_id: id}, update, function (err,result) {
            if(err){

            }else{

            }
        })
    }

    selectAll(callback){
        this.PRO.find({}, {}, {sort: {'lastUpdateTime': -1}}, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success, result);
            }
        })
    }

    selectById(id, resolve, reject){
        this.PRO.findById(id, function (err,result) {
            if(err){
                reject();
            }else{
                result ? resolve() : reject();
            }
        })
    }

    selectProById(id, callback){
        this.PRO.findById(id, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success, result);
            }
        })
    }

    queryByCode(param, callback){
        let reg = new RegExp(param);
        this.PRO.find({projectCode: reg},function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success, result);
            }
        })
    }

    queryByName(param, callback){
        let reg = new RegExp(param);
        this.PRO.find({projectName: reg},function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success, result);
            }
        })
    }
};