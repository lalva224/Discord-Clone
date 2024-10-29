import { createContext } from "vm";
import { authenticatedMutation, authenticatedQuery } from "./helpers";
import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";
import {v} from 'convex/values'
//custom query runs first: checking if current user is authenticated, then new query is ran: finding friends
//indexing is a fast lookup method. It is used to quickly find data without having to search through every single record. Essentially it creates an new data structure which stores it 
export const listPending = authenticatedQuery({
    handler: async (ctx)=>{
        //friends pending for current user
        const friends = await ctx.db.query('friends').withIndex('by_user_receiving_status',
            (q)=>q.eq('user_receiving',ctx.user._id).eq('status','pending')).collect()

            //look at mapwithUsers for more information
           return await mapWithUsers(ctx,friends,'user_sending')
        
    }
})

export const listAccepted = authenticatedQuery({
    handler: async (ctx)=>{
        //this gets friends that the current user has accepted
        const friends_sending_accepted = await ctx.db.query('friends').withIndex('by_user_sending_status',
            (q)=>q.eq('user_sending',ctx.user._id).eq('status','accepted')).collect()
        
            //this gets friends that have accepted the current user's friend request
        const friends_receiving_accepted = await ctx.db.query('friends').withIndex('by_user_receiving_status',
                (q)=>q.eq('user_receiving',ctx.user._id).eq('status','accepted')).collect()
        
        
        const friends_current_user_accepted= await mapWithUsers(ctx,friends_sending_accepted,'user_receiving')
        const friends_accepted_current_user = await mapWithUsers(ctx,friends_receiving_accepted,'user_sending')
        return [...friends_current_user_accepted,...friends_accepted_current_user]
    }
})

export const createFriendRequest = authenticatedMutation({
    args:{username:v.string()},
    handler: async (ctx,{username})=>{
        const user = await ctx.db.query('users').withIndex('by_username',(q)=>q.eq('username',username)).unique()

        //try sending toast message if user not found
        if(!user){
            throw new Error('user not found')
        }
        else if(user._id ==ctx.user._id){
            throw new Error('Cannot friend yourself')
        }

        await ctx.db.insert('friends',{
            user_sending: ctx.user._id,
            user_receiving: user._id,
            status: 'pending'
        })
    }
})
export const updateStatus = authenticatedMutation({
    args:{
        //ensure it is an existing friend id
        id: v.id('friends'),
        status: v.union(v.literal('accepted'),v.literal('rejected'))
    },
    handler: async (ctx, {id,status})=>{
        const friend = await ctx.db.get(id)
        if(!friend){
            throw new Error('Friend not found')
        }
        //? need to understand what friend.user_receiving and friend.user_sending are
        if(friend.user_receiving != ctx.user._id && friend.user_sending != ctx.user._id){
            throw new Error('Not authorized')
        }
        await ctx.db.patch(id,{status})
        
    }
})
//need to look into this insane TS synytax.
const mapWithUsers = async <K extends string, T extends{[key in K]: Id<'users'>}>(ctx:QueryCtx,items:T[],key:K)=>{
    //without Promise.all() the items are returned one by one, which is bad UI.
     //Promise.all() waits for all promises to be fufilled, Promise.allSettled() waits for all promises to be settled( fufilled or rejected)
     //Promise would get rejected if user is not found. 
    //why would the promise get rejected in the first place?
    const result = await Promise.allSettled(items.map(async(item)=>{
        const user = await ctx.db.get(item[key])
        if (!user){
            throw new Error('User not found')
        }
        return {
            ...item,
            user
        }
    })
    )
    return result.filter((r)=>r.status=='fulfilled').map((r)=>r.value)
}

