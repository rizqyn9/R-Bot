import {Message} from "@open-wa/wa-automate";
import {exampleGrpMsgReq, exampleUsrMsgReq} from "../Documentation/message.respons.docs";
import {
    typeGroupSchema,
    typeUserInGroup,
    typeUserSchema
} from '../databases/model'
import {IPrefix} from "../utils/interface";
import {validateFormUserRegist} from "../message/routing";


const regisTest = (msg : Message) => {

    if(msg.isGroupMsg){
        console.log("group")
        let data: typeGroupSchema = {
            groupID         : msg.chatId,
            owner           : msg.chat.groupMetadata.owner.toString(),
            groupName       : msg.chat.name,
            isPremium       : false,
        }
        console.log(data)
    } else {
        console.log("user")
        let pref : IPrefix = {
            prefix: "#",
            cmd1 : "regis"
        }
        console.log(
            validateFormUserRegist(msg.body, pref)
        )

    }
}


regisTest(exampleUsrMsgReq as unknown as Message)
regisTest(exampleGrpMsgReq as unknown as Message)