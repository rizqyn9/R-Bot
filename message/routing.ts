import {Client, Message} from '@open-wa/wa-automate'
import {typeConfigBot, ConfigBot, redisClient} from '../config'
import {enumCommand, IPrefix, Logger} from "../utils";
import {typeUserSchema, typeUserInGroup, typeGroupSchema, Groups, Users} from "../databases/model";
import fs from 'fs'
import {authorizingController, RegistController} from "./controller/authorization";

/**
 * - Validate prefix
 * - Authorization Users / Groups
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
        if(prefix.cmd1 && ["daftar", "regis", "join"].includes(prefix.cmd1)){
            return await RegistController(Rbot, msg, prefix);
        }


        /** Give authorization
         * user authorize in Redis will return permission access
         * user authorize in Mongo will set redis key to caching in next request
         * user non authorize will return msg to regist their own
         */
        // console.log(msg.chatId)
        let dataAuthorized = await authorizingController(msg.chatId, msg.isGroupMsg)
            .then(res => {
                console.log(res)
                return res
            })
            .catch(err => {
                Logger.error(err)
            })
        if(!dataAuthorized) return Rbot.sendText(msg.chatId, `${msg.isGroupMsg ? "Group" : "Kamu"} belum terdaftar`)

        if(prefix.prefix == "#"){
            if(!prefix.cmd1) return

            if(["gay", "kontol", "memek", "anjing"].includes(prefix.cmd1)){
                let img = await fs.readFileSync(`./public/${prefix.cmd1}.png`, {encoding : "base64"})
                console.log(img)
                return Rbot.sendImage(msg.chatId, `data:image/png;base64,${img.toString()}`, "", "Nih,,,", msg.id)
            }

            if("surya" == prefix.cmd1){
                let vid = await fs.readFileSync('public/surya.mp4', {encoding : "base64"})
                // console.log(vid)
                return Rbot.sendFile(msg.chatId, `data:video/mp4;base64,${vid}`, "surya.mp4", "Gak surya gak asek")
            }
            if("quote1" == prefix.cmd1){
                let vid = await fs.readFileSync('public/quotes.mp4', {encoding : "base64"})
                // console.log(vid)
                return Rbot.sendFile(msg.chatId, `data:video/mp4;base64,${vid}`, "surya.mp4", "Kuots ov de dey")
            }
        }
    } catch (e) {
        Logger.error(`messageRouter ${e}`)
    }
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