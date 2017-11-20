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
            api: {
                type: Object,
                required: true
            }
        });
        this.His = this.conn.model('op_history', this.opHistorySchema);
    }

    add(hisObj){
        let hisInstance = new this.His(hisObj);
        hisInstance.save(function (err, result) {
            if(err){
                console.log(err)
            }
        });
    }

    getAllById(id, callback){
        this.His.find({refApiId: id}, function (err,result) {
            if(err){
                status.fail.msg = err;
                callback(status.fail);
            }else{
                callback(status.success, result);
            }
        })
    }

};