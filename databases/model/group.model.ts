import {Schema, model, Model} from 'mongoose'

export type typeUserInGroup = {
    id: string,
    name : string
}

export type typeGroupSchema = {
    idNumber : string,
    owner? : string,
    groupName? : string,
    isPremium? : boolean,
    listMember? : Array<typeUserInGroup>,
    registerUser? : typeUserInGroup,
    totalMember? : number,
}

const GroupSchema : Schema = new Schema({
    idNumber : {type : String},
    owner : {type : String},
    groupName : {type : String},
    isPremium : {type : Boolean},
    listMember : {type : Array},
    registerUser : {type : Object},
    totalMember : {type : Number},
})

export const Groups = model<typeGroupSchema>("Group" ,GroupSchema )
