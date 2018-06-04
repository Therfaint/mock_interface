/**
 * Created by therfaint- on 13/11/2017.
 */
import mongoose from 'mongoose';
import status from './dbConfig/DB_Op_Status';
import options from './dbConfig/commonCfg';

mongoose.Promise = global.Promise;

export default class voteDbUtils{

    constructor(){

        this.conn = mongoose.createConnection('mongodb://127.0.0.1:27017/vote', options);

        this.conn.on('error', function(error){
            console.log('Vote DataBase Connect Failed !!\n' + error);
        });

        this.conn.once('open',function(error){
            if(error){
                console.log('Vote DataBase Connect Failed !!\n' + error);
            }
            console.log('Vote DataBase Connect Success ...');
        });

        this.voteSchema = new mongoose.Schema({
            userName: {
                type: String
            },
            select: {
                type: Array,
                required: true
            },
            experience: {
                type: String,
                required: true
            },
            description: {
                type: String
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