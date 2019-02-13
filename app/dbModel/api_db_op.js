/**
 * Created by therfaint- on 01/08/2017.
 */
import mongoose from 'mongoose';
import status from './dbConfig/DB_Op_Status';
import options from './dbConfig/commonCfg';

mongoose.Promise = global.Promise;

export default class apiDbUtil {

    constructor() {

        this.conn = mongoose.createConnection('mongodb://127.0.0.1:27017/api', options);

        this.conn.on('error', function (error) {
            console.log('API DataBase Connect Failed !!\n' + error);
        });

        this.conn.once('open', function (error) {
            if (error) {
                console.log('API DataBase Connect Failed !!\n' + error);
            }
            console.log('API DataBase Connect Success ...');
        });

        this.apiSchema = new mongoose.Schema({
            url: {
                type: String,
                required: true
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
            contentType: {
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
            refProId: {
                type: String,
                index: true
            },
            refModuleId: {
                type: String,
                index: true
            }
        });
        this.API = this.conn.model('api', this.apiSchema);
    }

    add(apiObj, callback) {
        let apiInstance = new this.API(apiObj);
        apiInstance.save(function (err, result) {
            if (err) {
                status.fail.msg = err;
                callback(status.fail);
            } else {
                callback(status.success, result);
            }
        });
    }

    batchAdd(apiArr, proCode, type, moduleId, callback) {

        let bool = true;

        if (type === 'module') {
            apiArr.map(item => {
                this.update(item._id, {refModuleId: proCode}, function (status) {
                    if (status.code === 500) {
                        bool = false;
                    }
                })
            });
        } else {
            apiArr.map(item => {
                let obj = {};
                let urlArr = item.url.split('/');
                urlArr[1] = proCode;
                obj['url'] = urlArr.join('/');
                // obj['param'] = item.param;
                obj['paramTable'] = item.paramTable;
                obj['method'] = item.method;
                obj['contentType'] = item.contentType;
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
        if (bool) {
            callback(true);
        } else {
            callback(false);
        }
    }

    deleteById(id, callback) {
        this.API.remove({_id: id}, function (err, result) {
            if (err) {
                status.fail.msg = err;
                callback(status.fail);
            } else {
                callback(status.success, result);
            }
        })
    }

    update(id, param, callback) {
        let update = {$set: param};
        this.API.update({_id: id}, update, function (err, result) {
            if (err) {
                status.fail.msg = err;
                callback(status.fail, result);
            } else {
                this.wsPush(id, callback);
            }
        }.bind(this))
    }

    wsPush(id, callback){
        this.API.find({_id: id}, {json: 1, _id: 0}, function (err, result) {
            if (err) {
                status.fail.msg = err;
                callback(status.fail);
            } else {
                let res = result[0].json;
                callback(status.success, res);
            }
        })
    }

    getAPI(url, query, type, callback) {
        let selectParam = {url: url, method: type};
        this.API.find(selectParam, {json: 1, paramTable: 1}, function (err, result) {
            if (err) {
                status.fail.msg = err;
                callback(status.fail);
            } else {
                if (Object.keys(query).length !== 0) {
                    let res;
                    result.map(item => {
                        let s = true;
                        for (let k in query) {
                            if (item.paramTable.indexOf(k) === -1) {
                                s = false;
                            }
                        }
                        if (s) {
                            res = item;
                        }
                    });
                    if (res) {
                        callback(status.success, [res]);
                    } else {
                        callback(status.success, []);
                    }
                } else {
                    callback(status.success, result);
                }
            }
        })
    }

    queryByParams(param, proCode, callback) {
        let reg = new RegExp(`/${proCode}/${param}`);
        this.API.find({url: reg}, function (err, result) {
            if (err) {
                status.fail.msg = err;
                callback(status.fail);
            } else {
                callback(status.success, result);
            }
        })
    }

    selectAll(callback) {
        this.API.find({}, {}, {sort: {'createTime': -1}}, function (err, result) {
            if (err) {
                status.fail.msg = err;
                callback(status.fail);
            } else {
                callback(status.success, result);
            }
        })
    }

    getAllById(id, callback) {
        this.API.find({refProId: id}, function (err, result) {
            if (err) {
                status.fail.msg = err;
                callback(status.fail);
            } else {
                callback(status.success, result);
            }
        })
    }

    getAllByModuleId(id, callback) {
        this.API.find({refModuleId: id}, function (err, result) {
            if (err) {
                callback({})
            } else {
                callback(result);
            }
        })
    }

    importAPIs(proId, apiArr, callback) {
        this.API.find({_id: {$in: apiArr}}, function (err, result) {
            if (err) {
                callback(false, err);
            } else {
                result.map(item => {
                    item.refProId = proId;
                });
                callback(true, result);
            }
        })
    }

};