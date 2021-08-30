import IORedis from "ioredis";
import util,{promisify} from 'util'

const client = new IORedis()

// client.monitor(function (err, monitor) {
//     // Entering monitoring mode.
//     monitor.on("monitor", function (time, args, source, database) {
//         console.log(time + ": " + util.inspect(args));
//     });
// });


export const redisTest = async (key: string) => {
    try {
        let obj = {
            data1 : "data1",
            data2 : "data2",
        }
        // await client.hmset(key, obj).then(value => {
        //     console.log(value)
        // })

        await client.exists(key).then((value => {
            console.log(value)
        }))

        await client.get(key).then(value => console.log(value))
    } catch (e) {
        console.log(e)
    }
}
