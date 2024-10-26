import { internalMutation } from "../_generated/server";
import {v} from 'convex/values'
//internal mutation means we can't call this from our front end. We can call it within convex.
//advantages of internal mutation? Other than limiting power to front end.
export const upsert = internalMutation({
    args:{
        username: v.string(),
        image: v.string(),
        clerkId: v.string()
    },
    
    handler: async(ctx,args)=>{
        //eq stands for equals. We want query users and find the clerk Id that matches the on we are looking for.
        const user = await ctx.db.query('users').withIndex('by_clerkId',(q)=>q.eq('clerkId',args.clerkId)).unique()
        console.log(user)
        console.log(args)
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
        const user = await ctx.db.query('users').withIndex('by_clerkId',(q)=>q.eq('clerkId',clerkId)).unique()

        if(user){
            await ctx.db.delete(user._id)
        }
    }
    
    
})