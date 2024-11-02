import { convexToJson, v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./helpers";
import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

export const list = authenticatedQuery({
    args:{
        directMessage: v.id('directMessages')
    },
    handler: async(ctx,{directMessage})=>{
        //why q.field('user') instead of q.neq('user',ctx.user._id) ? -> neq does not offer the shorthand of offering the field name, the actual field is required to be inputted.
        const typingIndicators = await ctx.db.query('typingIndicators').withIndex('by_dm',(q)=>q.eq('directMessage',directMessage)).filter(q=>q.neq(q.field('user'),ctx.user._id)).collect()

        //so we can return in parallel and not have it come one after the other, this prevents bad ui.
        return await Promise.all(
            typingIndicators.map(async(indicator)=>{
                const user = await ctx.db.get(indicator.user)
                if(!user){
                    throw new Error('User not found')
                }
                return user?.username
            })
        )
    }
})
export const upsert = authenticatedMutation({
    args:{
        directMessage : v.id('directMessages')
    },
    handler: async(ctx,{directMessage})=>{
        //when to use unique() over first() ?
        const existing = await ctx.db.query('typingIndicators').withIndex('by_user_dm',(q)=>q.eq('user',ctx.user._id).eq('directMessage',directMessage)).unique()

        const expiresAt = Date.now() + 5000
        if (existing){
            //2nd param is field we want to update in our document, we grab the precise entry by querying and then patch expirationDate field with new value
            await ctx.db.patch(existing._id,{expirationDate:expiresAt})
        }
        else{
            //only kwarg for user is neccessary because their variables are different names, why the kwarg and variable names for directMessage and expirationDate are the same.
            await ctx.db.insert('typingIndicators',{user:ctx.user._id,directMessage,expirationDate:expiresAt})
        }
        //typing indicator will run for 5 seconds until we remove it. We schedule a removal if 5 seconds idle
        await ctx.scheduler.runAt(expiresAt,internal.functions.typing.remove,{
            directMessage,
            user: ctx.user._id,
            expiresAt
        })
    }
    
})

export const remove = internalMutation({
    args:{
        directMessage: v.id('directMessages'),
        user: v.id('users'),
        expiresAt: v.optional(v.number())

    },
    handler: async(ctx,{directMessage,user,expiresAt})=>{
        const existing = await ctx.db.query('typingIndicators').withIndex('by_user_dm',(q)=>q.eq('user',user).eq('directMessage',directMessage)).unique()
        //understand this conditional check
        if(existing && (!expiresAt || existing.expirationDate === expiresAt)){
            await ctx.db.delete(existing._id)

        }
    }
})