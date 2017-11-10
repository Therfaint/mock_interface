/**
 * Created by therfaint- on 18/08/2017.
 */

import dataFactory from './Data_Factory';

// 数据生产工厂类
let DF = new dataFactory;

export default {
    "@id": DF.getId,
    "@name": DF.getName,
    "@sex": DF.getSex,
    "@url": DF.getUrl,
    "@email": DF.getEmail,
    "@address": DF.getAddress,
    "@ip": DF.getIp,
    "@rate": DF.getRate,
    "@date": DF.getDate,
    "@datetime": DF.getDateTime,
    "@version": DF.getVersion
}