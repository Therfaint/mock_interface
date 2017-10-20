/**
 * Created by therfaint- on 23/08/2017.
 */

let mongoose = require('mongoose');
let status = require('./DB_Op_Status');

mongoose.Promise = global.Promise;

module.exports = class proDbUtil{

    constructor(){

        this.conn = mongoose.createConnection('mongodb://127.0.0.1:27017/project');

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
                type: String,
                required: true
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
                console.log(proObj.projectName + ' 添加成功!');
                callback(status.success);
            }
        });
    }

    // 批量删除
    // todo: 考虑级联删除
    // eg: db.users.remove({"_id":{ $in: [ 1,2,3]})
    deleteById(id, callback){
        this.PRO.remove({_id: id}, function (err,result) {
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
        this.PRO.update({_id: id}, update, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                console.log('_id: '+ id +' 更新成功!');
                callback(status.success, result);
            }
        })
    }

    selectAll(callback){
        this.PRO.find({}, {}, {sort: {'createTime': -1}}, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                console.log('全部项目查询成功!');
                callback(status.success, result);
            }
        })
    }

    // todo: 保留接口 当项目删除时删除关联的API

};