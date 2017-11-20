/**
 * Created by therfaint- on 01/08/2017.
 */
let express = require('express');
let router = express.Router();
let app = express();
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let apiHandler = require('./app/util/api_db_op');
let moduleHandler = require('./app/util/module_db_op');
let proHandler = require('./app/util/project_db_op');
let voteHandler = require('./app/util/vote_db_op');
let opHistoryHandler = require('./app/util/operationLog_db_op');

app.use(bodyParser.json({limit: '50mb'}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

let api = new apiHandler();
let mod = new moduleHandler();
let pro = new proHandler();
let vote = new voteHandler();
let his = new opHistoryHandler();

const webpack = require('webpack');

const webpackHotMiddleWare = require('webpack-hot-middleware');
const webpackDevMiddleWare = require('webpack-dev-middleware');
const config = require('./webpack.config');
const compiler = webpack(config);
app.use(webpackDevMiddleWare(compiler, {noInfo: true}));
app.use(webpackHotMiddleWare(compiler));

app.use(express.static('public'));

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const renderFullPage = () => {
    return `
    <!doctype html>
    <html lang="utf-8">
    	<head>
    	<link rel="stylesheet" type="text/css" href="/antd.min.css" />
    	<link rel="stylesheet" type="text/css" href="/apiManage.css" />
    	<script src="/jquery-1.11.1.js"></script>
    	</head>
    	<body>
    		<section id="todoapp" class="todoapp"></section>
    		<script src="/bundle.js"></script>
    	</body>
    </html>
    `
};

const notFound = () => {
    return `
    <!doctype html>
    <html lang="utf-8">
    	<head>
    	</head>
    	<body>
    		<section>Page Not Found</section>
    	</body>
    </html>
    `
};

// 重定向到首页
app.get('/', function (req, res) {
    res.redirect('/project');
});

// project页面
app.get('/project', function (req, res) {
    const page = renderFullPage();
    res.status(200).send(page);
});

// wiki页面
app.get('/wiki/pageId=*', function (req, res) {
    // 判断pageId是否存在 不存在返回404 Not Found
    let pageId = req.url.split('pageId=')[1];
    pro.selectById(pageId, function(){
        const page = renderFullPage();
        res.status(200).send(page);
    }, function () {
        res.status(200).send(notFound());
    });
});

/* 历史记录操作 */

app.post('/hisRollback.json', function (req, res) {
    api.update(req.body.id, req.body.param, function (status, result) {
        pro.updateLastUpdateTime(req.body.proId, req.body.lastUpdateTime);
        if (status.code === 200) {
            res.status(200).json({
                success: true
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    })
});

app.get('/getHisById.json', function (req, res) {
    his.getAllById(req.query.id, function (status, result) {
        if (status.code === 200) {
            res.status(200).json({
                success: true,
                result
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    })
});

/* 投票操作 */

app.get('/getAllVote.json', function (req, res) {
    vote.selectAll(function (status, result) {
        if (status.code === 200) {
            res.status(200).json({
                success: true,
                result
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    })
});

app.post('/saveVote.json', function (req, res) {
    if (req.cookies.isVoted) {
        res.status(200).json({
            success: false,
            msg: '感谢您的建议和评价但只有一次机会哦'
        })
    } else {
        let voteObj = {
            select: req.body.select,
            experience: req.body.experience,
            voteTime: req.body.voteTime,
        };
        vote.add(voteObj, function (status) {
            res.cookie('isVoted', true, {maxAge: 60 * 60 * 60 * 1000});
            if (status.code === 200) {
                res.status(200).json({
                    success: true,
                    msg: '感谢您提出的宝贵建议'
                })
            } else if (status.code === 500) {
                res.cookie('isVoted', false, {maxAge: 60 * 60 * 60 * 1000});
                res.status(200).json({
                    success: false,
                    msg: status.msg
                })
            }
        });
    }
});

/* 接口操作 */

app.post('/saveApi.json', function (req, res) {
    let apiObj = {
        url: `/${req.body.proCode}${req.body.url}`,
        // param: req.body.param,
        paramTable: req.body.paramTable,
        method: req.body.method.toUpperCase(),
        createTime: req.body.createTime,
        json: req.body.json,
        jsonTable: req.body.jsonTable,
        description: req.body.description,
        refProId: req.body.proId,
        refModuleId: req.body.moduleId
    };
    api.add(apiObj, function (status, result) {
        if (status.code === 200) {
            let hisObj = {
                refApiId: result._id,
                opTime: req.body.createTime,
                // opUser: req.body.opUser,
                api: apiObj
            };
            his.add(hisObj);
            pro.updateLastUpdateTime(req.body.proId, req.body.createTime);
            res.status(200).json({
                success: true
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    });
});

app.post('/deleteApi.json', function (req, res) {
    api.deleteById(req.body.id, function (status) {
        if (status.code === 200) {
            pro.updateLastUpdateTime(req.body.proId, req.body.lastUpdateTime);
            res.status(200).json({
                success: true
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false
            })
        }
    });
});

app.post('/updateApi.json', function (req, res) {
    let id = req.body.id;
    let param = {
        url: `/${req.body.proCode}${req.body.url}`,
        // param: req.body.param,
        method: req.body.method,
        json: req.body.json,
        paramTable: req.body.paramTable,
        jsonTable: req.body.jsonTable,
        description: req.body.description,
        refProId: req.body.proId,
        refModuleId: req.body.moduleId
    };
    let hisObj = {
        refApiId: id,
        opTime: req.body.lastUpdateTime,
        // opUser: req.body.opUser,
        api: param
    };
    api.update(id, param, function (status) {
        if (status.code === 200) {
            pro.updateLastUpdateTime(req.body.proId, req.body.lastUpdateTime);
            his.add(hisObj);
            res.status(200).json({
                success: true
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    });
});

app.get('/getAllApi.json', function (req, res) {
    api.selectAll(function (status, result) {
        if (status.code === 200) {
            res.status(200).json({
                success: true,
                result
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    })
});


app.get('/getAllApiById.json', function (req, res) {
    api.getAllById(req.query.proId, function (status, result) {
        if (status.code === 200) {
            res.status(200).json({
                success: true,
                result
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    })
});

app.post('/queryByParam.json', function (req, res) {
    api.queryByParams(req.body.url, req.body.proCode, function (status, result) {
        if (status.code === 200) {
            res.status(200).json({
                success: true,
                result
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    });
});

app.post('/importAPIs.json', function (req, res) {
    api.importAPIs(req.body.proId, req.body.apiArr, function (status, result) {
        if (status) {
            api.batchAdd(result, req.body.proCode, 'pro', req.body.moduleId, function(status){
                res.status(200).json({
                    success: status
                })
            })
        } else {
            res.status(200).json({
                success: false
            })
        }
    });
});

/* 模块操作 */

app.post('/saveModule.json', function (req, res) {
    let moduleObj = {
        moduleName: req.body.moduleName,
        description: req.body.description,
        refProId: req.body.proId
    };
    mod.add(moduleObj, function (status) {
        if (status.code === 200) {
            res.status(200).json({
                success: true
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    });
});

app.post('/deleteModule.json', function (req, res) {
    // todo: 把删除的变量存放，
    mod.deleteById(req.body.id, function (status, module) {
        if (status.code === 200) {
            api.getAllByModuleId(req.body.id, function(result){
                if(result){
                    api.batchAdd(result, req.body.rootId, 'module', 'placeholder', function(status){
                        res.status(200).json({
                            success: status
                        })
                    })
                }else{
                    res.status(200).json({
                        success: false
                    })
                }
            });
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: '模块删除失败'
            })
        }
    });
});

app.get('/getAllModule.json', function (req, res) {
    mod.selectAll(function (status, result) {
        if (status.code === 200) {
            res.status(200).json({
                success: true,
                result
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    })
});

app.get('/getAllModuleById.json', function (req, res) {
    mod.getAllById(req.query.proId, function (status, result) {
        if (status.code === 200) {
            res.status(200).json({
                success: true,
                result
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    })
});


/* 项目操作 */

app.post('/savePro.json', function (req, res) {
    let proIns = {
        projectCode: req.body.projectCode,
        projectName: req.body.projectName,
        description: req.body.description,
        createTime: req.body.createTime,
        lastUpdateTime: req.body.createTime,
    };
    if(req.body.projectCode === 'template'){
        proIns['tag'] = true;
    }
    pro.add(proIns, function (status, result) {
        if (status.code === 200) {
            res.status(200).json({
                success: true,
                id: result._id
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    });
});

app.post('/deletePro.json', function (req, res) {
    pro.deleteById(req.body.id, function (status) {
        if (status.code === 200) {
            res.status(200).json({
                success: true
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false
            })
        }
    });
});

app.get('/getAllPro.json', function (req, res) {
    pro.selectAll(function (status, result) {
        if (status.code === 200) {
            result.map((item, index)=>{
                item.key = item._id;
                if(item.tag){
                    let removeItem = result.splice(index, 1);
                    result.unshift(removeItem[0]);
                }
            });
            res.status(200).json({
                success: true,
                result
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    })
});


app.get('/getProById.json', function (req, res) {
    pro.selectProById(req.query.id, function (status, result) {
        if (status.code === 200) {
            res.status(200).json({
                success: true,
                result
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    })
});

app.post('/queryByCodeOrName.json', function (req, res) {
    const callback = function (status, result) {
        if (status.code === 200) {
            result.map((item, index)=>{
                item.key = item._id;
                if(item.tag){
                    let removeItem = result.splice(index, 1);
                    result.unshift(removeItem[0]);
                }
            });
            res.status(200).json({
                success: true,
                result
            })
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    };
    if(req.body.searchType === 'projectName'){
        pro.queryByName(req.body.input, callback);
    }else{
        pro.queryByCode(req.body.input, callback);
    }
});

/* 处理外部访问 暴露存储接口 */

app.post('*', function (req, res) {
    // let param = {};
    // for (let k in req.body) {
    //     if (!isNaN(Number(req.body[k]))) {
    //         param[k] = parseInt(req.body[k]);
    //     } else if (req.body[k] === 'true') {
    //         param[k] = true;
    //     } else if (req.body[k] === 'false') {
    //         param[k] = false;
    //     } else {
    //         param[k] = req.body[k];
    //     }
    // }
    api.getAPI(req.originalUrl, 'POST', function (status, result) {
        if (status.code === 200) {
            let ret;
            switch (result.length) {
                case 0:
                    ret = {msg: '未查询到相应记录!'};
                    break;
                case 1:
                    ret = result[0].json;
                    break;
                default:
                    ret = {msg: '该接口信息存在重复!'};
                    break;
            }
            res.status(200).send(ret);
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    });
});

app.get('*', function (req, res) {
    if (req.originalUrl === '/antd.min.css.map' || req.originalUrl === '/favicon.ico') {
        res.status(404).send('Server.js > 404 - Page Not Found');
        return;
    }
    // decode解决中文乱码问题
    api.getAPI(decodeURI(req.originalUrl), 'GET', function (status, result) {
        if (status.code === 200) {
            let ret;
            switch (result.length) {
                case 0:
                    ret = {msg: '未查询到相应记录!'};
                    break;
                case 1:
                    ret = result[0].json;
                    break;
                default:
                    ret = {msg: '该接口信息存在重复!'};
                    break;
            }
            res.status(200).send(ret);
        } else if (status.code === 500) {
            res.status(200).json({
                success: false,
                msg: status.msg
            })
        }
    });
});

app.get('*', function(req, res) {
    res.status(404).send('Server.js > 404 - Page Not Found');
});

app.use((err, req, res, next) => {
    console.error("Error on request %s %s", req.method, req.url);
    console.error(err.stack);
    res.status(500).send("Server error");
});

app.listen(3000, function () {
    console.log('Listening on port 3000');
});