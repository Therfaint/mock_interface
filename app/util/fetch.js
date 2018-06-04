import 'whatwg-fetch';
// import serialize from 'serialize-javascript'
export default function fetchClient(url, body, head, opt) {

    const cfg = {
        credentials: 'include',
        mode: 'cors'
    };

    if (!body) {
        // GET
        cfg.method = 'GET';
    }else{
        // POST
        cfg.method = 'POST';
        cfg.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        cfg.body = JSON.stringify(body);
    }


    if (head) {
        for (let key of Object.keys(head)) {
            cfg.headers[key] = head[key]
        }
    }

    if (opt) {
        for (let key of Object.keys(opt)) {
            cfg[key] = opt[key]
        }
    }

    return fetch(url, cfg).then(res => {
        try {
            if (res.status === 200) {
                return res.json()
            }else if (res.status === 500) {
                return {
                    msg: 'Server Error!'
                }
            }
            return { code: 900, errRes: res }

        } catch (e) {
            return { code: 500, errRes: 'json can not resolve' }
        }
    })
}
