/**
 * Created by therfaint- on 08/11/2017.
 */
import mongoose from 'mongoose';
import status from './dbConfig/DB_Op_Status';
import options from './dbConfig/commonCfg';

mongoose.Promise = global.Promise;

export default class moduleDbUtil{

    constructor(){

        this.conn = mongoose.createConnection('mongodb://127.0.0.1:27017/module', options);

        this.conn.on('error', function(error){
            console.log('Module DataBase Connect Failed !!\n' + error);
        });

        this.conn.once('open',function(error){
            if(error){
                console.log('Module DataBase Connect Failed !!\n' + error);
            }
            console.log('Module DataBase Connect Success ...');
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
                type: String
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