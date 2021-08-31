import {Client, Message} from "@open-wa/wa-automate";
import {IPrefix} from "../../../utils/interface";
import {Groups, typeGroupSchema, Users} from "../../../databases/model";
import {enumCommand, Logger} from "../../../utils/logger";
import {validateFormUserRegist} from "./validateForm.controller";

export async function RegistController(Rbot: Client, msg: Message,  prefix: IPrefix) {
    if (msg.isGroupMsg) {
        let isExisting = await Groups.findOne({idNumber: msg.chatId})
        if (isExisting) {
            Logger.bot("Group existing")
            return Rbot.sendText(msg.chatId, "This group already registered")
        }
        let data: typeGroupSchema = {
            idNumber: msg.chatId,
            owner: msg.chat.groupMetadata.owner.toString(),
            groupName: msg.chat.name,
            isPremium: false,
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
        let isExisting = await Users.findOne({idNumber: msg.chatId})
        if (isExisting) {
            Logger.bot("User existing")
            return Rbot.sendText(msg.chatId, "This user already registered")
        }
        let resIsValid: undefined | { name: string, address: string } = validateFormUserRegist(msg.body, prefix)
        if (!resIsValid) {
            Logger.error("User Regist request not authorized", enumCommand.REG)
            return Rbot.sendText(msg.chatId, `Format salah`)
        }

        console.log(resIsValid)
        return await new Users({
            idNumber: msg.chatId,
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
