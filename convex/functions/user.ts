import { internalMutation, MutationCtx, QueryCtx, query } from "../_generated/server";
import {v} from 'convex/values'
//internal mutation means we can't call this from our front end. We can call it within convex.
//advantages of internal mutation? Other than limiting power to front end.

//this gets the current user's clerk id. By placing it inside query function, we can call it from the front end.
export const get = query({
    handler: async(ctx) => {
        return await getCurrentUser(ctx)
    }
})

export const upsert = internalMutation({
    args:{
        username: v.string(),
        image: v.string(),
        clerkId: v.string()
    },
    
    handler: async(ctx,args)=>{
        //eq stands for equals. We want query users and find the clerk Id that matches the on we are looking for.
        const user = await getUserByClerkId(ctx,args.clerkId)
        //if user is found update information, otherwise create it.
        if(user){
            //patch for updating
            await ctx.db.patch(user._id,{
                username: args.username,
                image: args.image
            })
        }
        else{
            //insert into users table
            await ctx.db.insert('users',{
                username: args.username,
                image: args.image,
                clerkId: args.clerkId
            })
        }
    }
})

export const remove = internalMutation({
    args:{clerkId: v.string()},
    handler: async(ctx,{clerkId})=>{
        const user = await getUserByClerkId(ctx,clerkId)
        if(user){
            await ctx.db.delete(user._id)
        }
    }
    
    
})

//how do i randomly figure out type?
export const getCurrentUser = async(ctx:QueryCtx | MutationCtx)=>{
    //This is for authenticated users. For when I need their clerk Ids. returns objects with several properties. Among them is clerk user id. 
    const identity = await ctx.auth.getUserIdentity()
    if(!identity){
        return null
    }
    //subject is user id when referring to JWTs
    return await getUserByClerkId(ctx,identity.subject)
}   

const getUserByClerkId = async(ctx:QueryCtx | MutationCtx,clerkId:string)=>{
    return await ctx.db.query('users').withIndex('by_clerkId',(q)=>q.eq('clerkId',clerkId)).unique()

}