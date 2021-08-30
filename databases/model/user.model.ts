import {Schema, model, Model} from 'mongoose'

export type typeUserSchema = {
    idNumber : string,
    name : string,
    address : string,
    isPremium : boolean,
    groupList? : Array<any>,
}

const UserSchema : Schema = new Schema({
    idNumber : {type : String},
    name : {type : String},
    address : {type : String},
    isPremium : {type : Boolean},
    groupList : {type : Array, default:[]},
})

export const Users = model<typeUserSchema>("User" ,UserSchema )
