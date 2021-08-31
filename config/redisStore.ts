import Redis from 'ioredis'
import {enumCommand, Logger} from "../utils/logger";

let client = new Redis();

export const redisClient = client.duplicate()

client.on("connect", () => {
    Logger.warn("Connect to Redis", enumCommand.RDIS)
})
client.on("ready", () => {
    Logger.done("Redis already to use", enumCommand.RDIS)
})
client.on("error", () => {
    Logger.error("Redis Database error", enumCommand.RDIS)
    Logger.error("Turn off system", enumCommand.RDIS)
    process.exit()
})
client.on("reconnecting", () => {
    Logger.warn("Redis on Reconnecting", enumCommand.RDIS)
})