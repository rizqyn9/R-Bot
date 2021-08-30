import {enumCommand, IPrefix, Logger} from '../utils'
import {ConfigBot} from "../config";
import {redisTest} from "./authorize.test";
import {validPrefix} from "../message/routing";



const MainTest = async () => {
    let target : string = "    #haha sada sad"
    await validPrefix(target)

}

MainTest()




// region Validate Prefix
const reqTest2 = " !hahah#  !asdsad asdsa"

const proceTest2 = (req :string) => {
    return avalidPrefix(reqTest2)
}
/**
 * Just clearance whitespace, get prefix and set to prefix Interface
 * @param target
 * @param validate
 */
const avalidPrefix = (target : string, validate :Array<string> = ConfigBot.prefixAllowed) : IPrefix=> {
    let res : IPrefix = {prefix : null}
    target = target.trim()
    for (let i = 0; i < validate.length; i++ ){
        if( target.startsWith(validate[i])) {
            res.prefix = validate[i]
            break;
        }
    }
    return res
}

// console.log(
//     proceTest2(reqTest2)
// )
//


//endregion


// region Test Command

const req : string = "#haha  asd asd"

const handleCommand = (cmd : string) :string|null => {
    let isCmd = ConfigBot.prefixAllowed.includes(cmd.charAt(0))
    if(!isCmd) return null
    return cmd.charAt(0)
}

// console.log(
//     handleCommand(req)
// )

//endregion


//region Logger
const TestLogger = () => {
    Logger.error("hahah")
    Logger.warn("hahah")
    Logger.bot("hahah")
    Logger.dev("hahah")
    Logger.done("hahah")
    Logger.process("hahah")
    Logger.custom("hahah")
}

// TestLogger()

//endregion