/**
 * Created by therfaint- on 01/08/2017.
 */
let express = require('express');
let router = express.Router();
let app = express();
let bodyParser = require('body-parser');
let dbClazz = require('./app/util/mongooDB_Util');

let db = new dbClazz();

app.use(bodyParser.urlencoded({extended: false}));
const webpack = require('webpack');

const webpackHotMiddleWare = require('webpack-hot-middleware');
const webpackDevMiddleWare = require('webpack-dev-middleware');
const config = require('./webpack.config');
const compiler = webpack(config);

app.use(express.static('public'));

app.use(webpackDevMiddleWare(compiler, {noInfo: true}));
app.use(webpackHotMiddleWare(compiler));

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
    		<script src="./bundle.js"></script>
    	</body>
    </html>
    `
};

app.get('/', function (req, res) {
    const page = renderFullPage();
    res.status(200).send(page);
});

app.post('/saveAPI', function (req, res) {
    let api = {
        url: req.body.url,
        param: req.body.param,
        paramTable: req.body.paramTable,
        method: req.body.method.toUpperCase(),
        createTime: req.body.createTime,
        json: req.body.json,
        jsonTable: req.body.jsonTable,
    };
    db.add(api, function (status) {
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

app.post('/deleteAPI', function (req, res) {
    db.deleteById(req.body.id, function (status) {
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

app.post('/updateAPI', function (req, res) {
    let id = req.body.id;
    let param = {
        url: req.body.url,
        param: req.body.param,
        method: req.body.method,
        json: req.body.json,
        paramTable: req.body.paramTable,
        jsonTable: req.body.jsonTable
    };
    db.update(id, param, function (status) {
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

app.get('/getAllApi', function (req, res) {
    db.selectAll(function (status, result) {
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

app.post('/queryByParam', function (req, res) {
    db.queryByParams(req.body.url, function (status, result) {
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

app.post('*', function (req, res) {
    let param = {};
    for (let k in req.body) {
        if (!isNaN(Number(req.body[k]))) {
            param[k] = parseInt(req.body[k]);
        } else if (req.body[k] === 'true') {
            param[k] = true;
        } else if (req.body[k] === 'false') {
            param[k] = false;
        } else {
            param[k] = req.body[k];
        }
    }
    db.getAPI(req.originalUrl, 'POST', JSON.stringify(param), function (status, result) {
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
        return;
    }
    // decode解决中文乱码问题
    db.getAPI(decodeURI(req.originalUrl), 'GET', null, function (status, result) {
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

app.listen(3000, function () {
    console.log('Listening on port 3000');
});