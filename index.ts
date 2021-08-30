import dotenv from 'dotenv'
import {Client, create, STATE} from '@open-wa/wa-automate'
import {FigletChalkStarter, Logger} from './utils'
import {connectMongoDB, initConfiguration, redisClient} from './config'
import {messageRouter} from "./message/routing"

dotenv.config()

const Start = async (RBot :Client) => {
    // region Logger Init
    FigletChalkStarter("R-Dev")
    Logger.dev("Made by R-Dev Github : rizqyn9")
    Logger.bot("Have a nice day Rizyqy")
    Logger.bot("R-Bot already for my Jobs")
    // endregion logger

    // region MongoDB Initialization
    // Connect to DB
    // @ts-ignore
    await connectMongoDB(process.env.MONGODB_URI).then(()=> {
        Logger.custom("Database connected", "[MongoDB]", 183)
    }).catch((err : string) => {
        Logger.error(err)
        process.exit()
    })
    //endregion

    // region State Handler
    RBot.onStateChanged((state) => {
        Logger.warn(`state : ${state}`)
        // Handle on change state Conf, Disconn
        if(state == STATE.CONFLICT
            || state == STATE.UNLAUNCHED
            || state == STATE.DISCONNECTED
        ){
            Logger.warn("Try to reconnecting")
            RBot.forceRefocus().catch((err) => {
                Logger.error(err)
            })
        }
    })
    // endregion


    RBot.onMessage((msg)=>{
        // Logger.bot("new msg")
        // console.log(msg)
        messageRouter(RBot, msg);
    })
}

//region Launch
const Launch = async () => {
    try {
        const client = await create(initConfiguration(true, Start))
        await Start(client)
    } catch (e) {
        Logger.error(`Err Launch : ${e}`)
    }
}

Launch()
//endregion Launch

