/**
 * Created by therfaint- on 18/08/2017.
 */

import r from './Random';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

const dateFormat = 'YYYY-MM-DD';
const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';

const getRandomDate = function() {
    let year, month, day;
    year = r.getIntRandomByRange(1990, 2017);
    month = r.getIntRandomByRange(1, 12);
    switch (month){
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12: day = r.getIntRandomByRange(0, 31);break;
        case 4:
        case 6:
        case 9:
        case 11: day = r.getIntRandomByRange(0, 30);break;
        case 2: day = r.getIntRandomByRange(0, 28);break;
        default: break;
    }
    return year + '-' + (month >= 10 ? month : ('0' + month)) + '-' + (day >= 10 ? day : ('0' + day));
};

export default class Data_Factory {

    // 后续可以考虑根据语言分类
    constructor(){

    }

    getId() {
        const letter = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
        let idStr = '';
        for (let i =0; i<10;i++){
            idStr = idStr + letter[Math.floor(Math.random()*(letter.length))];
        }
        return idStr;
    }

    getName() {
        const firstName = ['浩', '伟', '鑫', '荣', '雨', '文', '雅', '颖', '熙', '夕', '兮', '白', '然', '时', '珍', '龙', '辰', '春', '夏', '秋', '冬'];
        const lastName = ['王', '李' , '田', '陈', '崔', '周', '郑', '黄', '余', '姚', '高', '张', '肖', '童', '孔', '孟'];
        const max1 = firstName.length-1, max2 = lastName.length-1;
        let baseName = lastName[r.getIntRandomByRange(0, max2)] + firstName[r.getIntRandomByRange(0, max1)];
        if(r.getInt021() === 1){
            return baseName + firstName[r.getIntRandomByRange(0, max1)];
        }else {
            return baseName;
        }
    }

    getSex() {
        return r.getInt021() === 1 ? '男' : '女';
    }

    getUrl() {
        const protocol = ['http://', 'https://'];
        const domain = ['www.baidu.com', 'www.163.com', 'www.qq.com', 'www.tongdun.cn', 'www.sina.com', 'www.alibaba.com', 'www.taobao.com', 'www.google.com'];
        return protocol[Math.round(Math.random())] + domain[Math.floor(Math.random()*(domain.length))];
    }

    getEmail() {
        const firstName = ['xin','liang','jun','tong','ying','xi','rong','chen','ya','wen','kang','li','yi', 'man'];
        const lastName = ['tian','yu','chen','huang','zhou','zhang','li','yao','gao','sun'];
        const emailSuffix = '@tongdun.cn';
        const max1 = firstName.length-1, max2 = lastName.length-1;
        let baseName = firstName[r.getIntRandomByRange(0, max1)] + '.' + lastName[r.getIntRandomByRange(0, max2)] + emailSuffix;
        if(r.getInt021() === 1){
            return firstName[r.getIntRandomByRange(0, max1)] + baseName;
        }else {
            return baseName;
        }
    }

    getAddress() {
        const province = ['福建省','浙江省','江苏省','广东省','云南省','河南省'];
        const city = {
            0: ['厦门市','泉州市','龙岩市','福州市','漳州市','三明市'],
            1: ['宁波市','浙江市','温州市','嘉兴市','绍兴市','金华市'],
            2: ['南京市','无锡市','徐州市','常州市','苏州市','连云港市'],
            3: ['珠海市','东莞市','佛山市','中山市','惠州市','汕头市'],
            4: ['昆明市','曲靖市','丽江市','普洱市','玉溪市','宝山市'],
            5: ['郑州市','洛阳市','许昌市','驻马店市','开封市','周口市']
        };
        const street = ['开元街道','幸福路','内厝澳路','莲前东路','东浦路','湖滨西路','厦禾路','嘉禾路'];
        const pIndex = r.getIntRandomByRange(0, 5);
        const cIndex = r.getIntRandomByRange(0, 5);
        const sIndex = r.getIntRandomByRange(0, 7);
        const num = r.getIntRandomByRange(0, 1000);
        return province[pIndex] + city[pIndex][cIndex] + street[sIndex] + num + '号';
    }

    getIp() {
        return r.getIntRandomByRange(0, 255) + '.' + r.getIntRandomByRange(0, 255) + '.' + r.getIntRandomByRange(0, 255) + '.' +r.getIntRandomByRange(0, 255);
    }

    getRate() {
        return r.getFloat021();
    }

    getDate() {
        let date = getRandomDate();
        return date;
    }

    getDateTime() {
        let h, m, s;
        h = r.getIntRandomByRange(0, 24);
        m = r.getIntRandomByRange(0, 60);
        s = r.getIntRandomByRange(0, 60);
        return getRandomDate() + ' ' + (h >= 10 ? h : ('0' + h)) + ':' + (m >= 10 ? m : ('0' + m)) + ':' + (s >= 10 ? s : ('0' + s))
    }

    getVersion() {
        let o, t, th;
        o = r.getIntRandomByRange(0, 5);
        t = r.getIntRandomByRange(0, 10);
        th = r.getIntRandomByRange(0, 10);
        if(r.getInt021() === 1){
            return o + '.' + t + '.' + th;
        }else {
            return  o + '.' + t;
        }
    }

}