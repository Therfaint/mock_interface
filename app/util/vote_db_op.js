/**
 * Created by therfaint- on 13/11/2017.
 */
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

module.exports = class voteDbUtils{

    constructor(){

        this.conn = mongoose.createConnection('mongodb://127.0.0.1:27017/vote', options);

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

        this.voteSchema = new mongoose.Schema({
            userName: {
                type: String,
                // required: true
            },
            // userId: {
            //     type: String
            // },
            select: {
                type: Array,
                required: true
            },
            experience: {
                type: String,
                required: true
            },
            description: {
                type: String,
                // required: true
            },
            voteTime: {
                type: String,
                required: true
            }
        });
        this.Vote = this.conn.model('vote', this.voteSchema);
    }

    add(voteObj, callback){
        let voteInstance = new this.Vote(voteObj);
        voteInstance.save(function (err, result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success);
            }
        });
    }

    selectAll(callback){
        this.Vote.find({}, {}, {sort: {'voteTime': -1}}, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success, result);
            }
        })
    }

};