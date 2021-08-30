
let promise = new Promise((res, rej) => {
    res({
        haha : 1,
        ha : 2
    })
})

const mainTest = async () => {
    try{
        await promise.then(value => value).then(value => {
            console.log(value)
            throw value
        })
    }catch (e) {
        console.log(`Err :${e}`)
    }
}

mainTest()