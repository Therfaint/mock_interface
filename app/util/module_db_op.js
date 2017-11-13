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

module.exports = class moduleDbUtil{

    constructor(){

        this.conn = mongoose.createConnection('mongodb://127.0.0.1:27017/module', options);

        this.conn.on('error', function(error){
            console.log('数据库连接失败!\n' + error);
        });

        this.conn.once('open',function(error){
            if(error){
                console.log('数据库连接失败!\n' + error);
            }
            console.log('数据库连接成功...');
        });

        this.moduleSchema = new mongoose.Schema({
            refProId:{
                type: String,
                index: true
            },
            moduleName: {
                type: String,
                required: true
            },
            description:{
                type: String,
                // required: true
            }
        });
        this.Module = this.conn.model('module', this.moduleSchema);
    }

    add(moduleObj, callback){
        let moduleInstance = new this.Module(moduleObj);
        moduleInstance.save(function (err, result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success);
            }
        });
    }

    deleteById(id, callback){
        this.Module.remove({_id: id}, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success, result);
            }
        })
    }

    // update(id, param, callback){
    //     let update = {$set : param};
    //     this.Module.update({_id: id}, update, function (err,result) {
    //         if(err){
    //             status.fail.msg = err;
    //             callback(status.fail);
    //         }else{
    //             console.log('_id: '+ id +' 更新成功!');
    //             callback(status.success, result);
    //         }
    //     })
    // }

    selectAll(callback){
        this.Module.find({}, {}, {}, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success, result);
            }
        })
    }

    getAllById(id, callback){
        this.Module.find({refProId: id}, function(err,result){
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success, result);
            }
        })
    }

};