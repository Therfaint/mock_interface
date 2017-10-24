/**
 * Created by therfaint- on 23/10/2017.
 */

class Func_Options{

    constructor(){

    }

    range(paramArr){
        let start = Number(paramArr[0]);
        let end = Number(paramArr[1]);
        let result;
        do {
            result = Math.floor(Math.random()*((end-start+1)+start));
        } while(result < start || result > end);
        return result;
    }

    oneOf(paramArr){
        let length = paramArr.length;
        let index = Math.floor(Math.random()*((length)));
        return paramArr[index];
    }

}

export default Func_Options;