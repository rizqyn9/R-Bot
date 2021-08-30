import {Client, Message} from '@open-wa/wa-automate'
import {typeConfigBot, ConfigBot, redisClient} from '../config'
import {enumCommand, IPrefix, Logger} from "../utils";
import {typeUserSchema, typeUserInGroup, typeGroupSchema, Groups, Users} from "../databases/model";
import fs from 'fs'

/**
 * - Validate prefix
 * - Authorization Users / Groups
 * @param Rbot
 * @param msg
 */
export const messageRouter = async (Rbot : Client, msg : Message) => {
    try {
        // Validate prefix
        let prefix : IPrefix = await validPrefix(msg.body)
        if(prefix.prefix == null) return;
        // console.log(prefix)

        /** Registration User | Group
         * Create validation Form
         * Serve data to databases
         */
        //@ts-ignore
        if(["daftar", "regis", "join"].includes(prefix.cmd1)){
            if(msg.isGroupMsg){
                let isExisting = await Groups.findOne({idNumber:msg.chatId})
                if(isExisting){
                    Logger.bot("Group existing")
                    return Rbot.sendText(msg.chatId, "This group already registered")
                }
                let data: typeGroupSchema = {
                    idNumber         : msg.chatId,
                    owner           : msg.chat.groupMetadata.owner.toString(),
                    groupName       : msg.chat.name,
                    isPremium       : false,
                }
                return new Groups(data).save()
                    .then(val => {
                        Logger.done(JSON.stringify(val), enumCommand.REG)
                        return Rbot.sendText(msg.chatId, "Successed")
                    }).catch(err => {
                        Logger.error(err, enumCommand.REG)
                        return Rbot.sendText(msg.chatId, "Failed")
                    })
            } else {
                let isExisting = await Users.findOne({idNumber : msg.chatId})
                if(isExisting){
                    Logger.bot("User existing")
                    return Rbot.sendText(msg.chatId, "This user already registered")
                }
                let resIsValid: undefined | {name:string, address:string } = validateFormUserRegist(msg.body, prefix)
                if(!resIsValid) {
                    Logger.error("User Regist request not authorized", enumCommand.REG)
                    return Rbot.sendText(msg.chatId,`Format salah`)
                }
                console.log(resIsValid)
                return await new Users({
                    idNumber : msg.chatId,
                    name: resIsValid.name,
                    address: resIsValid.address,
                    isPremium: false,
                }).save().then(val => {
                    Logger.done(JSON.stringify(val), enumCommand.REG)
                    return Rbot.sendText(msg.chatId, "Successed")
                }).catch(err => {
                    Logger.error(err, enumCommand.REG)
                    return Rbot.sendText(msg.chatId, "Failed")
                })
            }
        }


        /** Give authorization
         * user authorize in Redis will return permission access
         * user authorize in Mongo will set redis key to caching in next request
         * user non authorize will return msg to regist their own
         */
        console.log(msg.chatId)
        let dataAuthorized = await authorizing(msg.chatId, msg.isGroupMsg)
            .then(res => {
                console.log(res)
                return res
            })
            .catch(err => {
                Logger.error(err)
            })
        if(!dataAuthorized) return Rbot.sendText(msg.chatId, `${msg.isGroupMsg ? "Group" : "Kamu"} belum terdaftar`)

        if(prefix.prefix == "#"){
            if("kontol") {
                let img = await fs.readFileSync("./public/unknown.png", {encoding : "base64"})
                // @ts-ignore
                return Rbot.sendImage(msg.chatId, `data:image/png;base64,${img.toString("base64")}`, "", "Nih,,,", msg.id)
            }
        }
    } catch (e) {
        Logger.error(`messageRouter ${e}`)
    }
}


// region authorizing
const authorizing = async (chatID : string, isGroup : boolean) => {
    try {
        // check existing data in redis
        let res = await redisClient.exists(chatID).then( async value => {
            // console.log(value)
            if(value === 1){
                return await redisClient.hgetall(chatID).then(value1 => {
                    Logger.redisDone(`Get cache ${JSON.stringify(value1)}`, enumCommand.RDIS)
                    return value1
                })
            } else{
                let data : any;
                if(isGroup){
                    data = await Groups.findOne({idNumber : chatID})
                } else {
                    data = await Users.findOne({idNumber : chatID})
                }
                if(data){
                    let cache = {
                        ID : data._id.toString(),
                        owner : data.owner,
                        name : data.groupName | data.groupID,
                        isPremium: data.isPremium
                    }
                    await redisClient.hmset(chatID, cache, (err,val) => {
                        Logger.redisDone(`Register redis cache ${JSON.stringify(cache)}`, enumCommand.RDIS)
                    })
                }
                // console.log("Mongodata : " + data)
                // Logger.done(JSON.stringify(data), enumCommand.MNGO)
                return data
            }
        })
        // console.log(res)
        return res
    }catch (e) {
        return new Error(e)
    }
}
// endregion

// region validate Form Regist
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


// region validate prefix
/**
 * Just clearance whitespace, get prefix and set to prefix Interface
 * @param target
 * @param validate
 */
export const validPrefix = (target : string, validate :Array<string> = ConfigBot.prefixAllowed) : IPrefix=> {
    let res : IPrefix = {prefix : null}
    target = target.trim()
    for (let i = 0; i < validate.length; i++ ){
        if( target.startsWith(validate[i])) {
            /**
             * add maximum value to splitting
             * bcs if no use limit, will make system heavy
             */
            let split: Array<string> = target.slice(1).split(/ +/, 10)
            res.prefix = validate[i]
            res.cmd1 = split[0].toLowerCase()
            break;
        }
    }
    // console.log(res)
    return res
}
//endregion