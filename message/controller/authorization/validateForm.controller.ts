// region validate Form Regist
import {IPrefix} from "../../../utils/interface";

export const validateFormUserRegist = (msg:string, prefix: IPrefix): {name:string, address:string} | undefined => {
    if(prefix.prefix && prefix.cmd1){
        let res = msg.split(`${prefix.prefix+prefix.cmd1}`)
        if(res.length < 2) return undefined
        let valid = res[1].split("|")
        if(valid.length < 2 || !valid[0] || !valid[1]) return undefined
        return {
            name : valid[0],
            address : valid[1]
        }
    }
    return undefined
}
