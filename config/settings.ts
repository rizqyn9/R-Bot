import * as wa from '@open-wa/wa-automate'
import {
    ConfigObject,
} from "@open-wa/wa-automate/dist/api/model/config";

/**
 * function to generated configuration will initialize on start
 * @param headles
 * @param start
 */
const initConfiguration = (headles = false, start:any):ConfigObject => {
    return {
        sessionId: 'rizqy',
        headless: headles,
        qrTimeout: 0,
        authTimeout: 0,
        restartOnCrash: start,
        cacheEnabled: false,
        useChrome: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        // logConsoleErrors:true,
        // logConsole:true,
        killProcessOnBrowserClose: true,
        throwErrorOnTosBlock: false,
        chromiumArgs: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--aggressive-cache-discard',
            '--disable-cache',
            '--disable-application-cache',
            '--disable-offline-load-stale-cache',
            '--disk-cache-size=0'
        ]
    }
}

export {
    initConfiguration
}