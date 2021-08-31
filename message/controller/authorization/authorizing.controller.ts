import {redisClient} from "../../../config";
import {enumCommand, Logger} from "../../../utils/logger";
import {Groups, Users} from "../../../databases/model";


// region authorizingController
export const authorizingController = async (chatID : string, isGroup : boolean) => {
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
        Logger.error("Authorizing Controller Error")
        return new Error(e)
    }
}
// endregion
