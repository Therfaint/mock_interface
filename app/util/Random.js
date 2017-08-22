/**
 * Created by therfaint- on 18/08/2017.
 */

const formatter = function(dataSource, length) {
    length = length ? length : 2 ;
    let intNum = String(dataSource).split('.')[0];
    let floatNum = String(dataSource).split('.')[1];
    return Number(intNum + floatNum.substring(0,length));
};

export default class Random {

    static getInt021() {
        return Math.round(Math.random());
    }

    static getFloat021(length) {
        length = length ? length : 2 ;
        let num = Math.random();
        let floatNum = String(num).split('.')[1];
        return Number('0.' + floatNum.substring(0,length));
    }

    static getIntRandomByRange(min, max) {
        min = Number(min);
        max = Number(max);
        let result;
        do {
            result = Math.floor(Math.random()*((max-min+1)+min));
        } while(result < min || result > max);
        return result;
    }

    static getFloatRandomByRange(min, max) {
        min = Number(min);
        max = Number(max);
        let result;
        if(min === 0 && max === 1)
            return Math.random();
        else
            do {
                result = Math.random()*((max-min+1)+min);
            } while(result < min || result > max);
        return formatter(result, 2);
    }

}