import makeWASocket, {
  useSingleFileAuthState,
  DisconnectReason,
} from "@adiwajshing/baileys";
import { Boom } from "@hapi/boom";
import P from "pino";
import { Logger } from "../utils/logger";
import { messageHandler } from "./message";
import { Authorization as AuthorizationUtils } from "./authorization";
import { RBotSocket, EnvProps } from "../types";
import { messageHelper } from "./message-helper";
import sizeOf from "object-sizeof";
import { getNumber } from "../utils/index";

const { state, saveState } = useSingleFileAuthState("./rbot_session.json");

async function StartRBot({ env }: { env: EnvProps }): Promise<RBotSocket> {
  try {
    const rBot: RBotSocket = {
      ...(await makeWASocket({
        printQRInTerminal: true,
        logger: P({ level: "silent" }),
        auth: state,
        version: [2, 2204, 13],
        browser: ["Rdev", "RDev", "RDev"],
      })),
      messageHelper,
      ENV: env,
      authorization: AuthorizationUtils,
    };

    Singleton.RBot = rBot;

    rBot.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      Logger.bot(
        `Connection ${update.connection}, last disconnect ${JSON.stringify(
          update.lastDisconnect
        )}`
      );
      if (connection === "close") {
        // reconnect if not logged out
        if (
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut
        ) {
          Logger.error(`Restart`);
          await StartRBot({ env });
        } else {
          Logger.error("Connection closed");
        }
      }
    });

    rBot.ev.on("messages.update", (data) => {
      // console.log("msgupdt", data);
    });

    rBot.ev.on("creds.update", saveState);

    rBot.ev.on("chats.set", (data) => {
      console.log("chat", data);
    });

    rBot.ev.on("messages.set", (data) => {
      console.log("msg", data);
    });

    rBot.ev.on("messages.upsert", (data) => {
      messageHandler(data.messages[0], data.type, rBot);
    });

    return rBot;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to instance WA Socket");
  }
}

export namespace Singleton {
  export let RBot: RBotSocket;
  export let ENV: EnvProps;
}

export { StartRBot };
export * as RedisStore from "./redis-store";
export * as MongoStore from "./mongo-store";
