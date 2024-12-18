import {query,mutation} from '../_generated/server'
import {v} from 'convex/values'
import { authenticatedMutation, authenticatedQuery } from './helpers'
import { internal } from '../_generated/api'

export const list = authenticatedQuery({
    args:{
        directMessage: v.id('directMessages')
    },
    //handler is function that is a function needed for query or mutation logic
    handler: async(ctx,{directMessage})=> {
        //ctx is short for context, an object used to retrieve database info, but also authorizaton info and logging ingo
        //collect grabs all of the data while take(x) grabs x amount of data
        //we are adding this. Just understand schema a bit more.
        const member = await ctx.db.query('directMessageMembers').withIndex('by_dm_user',(q)=>q.eq('directMessage', directMessage).eq('user',ctx.user._id)).first()
        if(!member){
            throw new Error('You are not a member of this direct message')
        }
        const messages =  await ctx.db.query("messages").withIndex('by_directMessage',(q)=>q.eq('directMessage',directMessage)).collect()

        return await Promise.all(messages.map(async (message)=>{
            const sender = await ctx.db.get(message.sender)
            //why does having it conditionally like this and not with if statements. Is it due to asynchronous behavior?
            const attachment = message.attachment ? await ctx.storage.getUrl(message.attachment) : undefined
            return {
                ...message,
                sender,
                attachment
            }
        }))

    }
})
export const remove = authenticatedMutation({
    args:{
        id: v.id('messages')
    },
    handler:async(ctx,{id})=>{
        const message = await ctx.db.get(id)
        if(!message){
            throw new Error('Message not found')
        }
        else if(message.sender !== ctx.user._id){
            throw new Error('You are not the sender of this message')
        }
        await ctx.db.delete(id)
        if(message.attachment){
            //what exactly is the storage object?
            await ctx.storage.delete(message.attachment)
        }
    }
})
export const create = authenticatedMutation({
    //args is the arguments that need to be passed to the mutation
    args:{
        content: v.string(),
        directMessage: v.id('directMessages'),
        attachment: v.optional(v.id('_storage'))
    },
    handler: async(ctx,{directMessage,content,attachment})=>{
        const member = await ctx.db.query('directMessageMembers').withIndex('by_dm_user',(q)=>q.eq('directMessage', directMessage).eq('user',ctx.user._id)).first()
        if(!member){
            throw new Error('You are not a member of this direct message')
        }
        await ctx.db.insert('messages',{directMessage,content,attachment,sender:ctx.user._id})
        //this is for removing the type indicator 0 seconds after message is sent.
        await ctx.scheduler.runAfter(0,internal.functions.typing.remove,{directMessage,user:ctx.user._id})
    }
}) 

export const generateUploadUrl = authenticatedMutation({
    handler: async(ctx)=>{
        //generates tempoary url, how would this be used?
        return await ctx.storage.generateUploadUrl()
    }
})