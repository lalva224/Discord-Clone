import {query,mutation} from '../_generated/server'
import {v} from 'convex/values'
export const list = query({
    //handler is function that is a function needed for query or mutation logic
    handler: async(ctx)=> {
        //ctx is short for context, an object used to retrieve database info, but also authorizaton info and logging ingo
        //collect grabs all of the data while take(x) grabs x amount of data
        return await ctx.db.query("messages").collect()
    }
})

export const create = mutation({
    //args is the arguments that need to be passed to the mutation
    args:{
        sender: v.string(),
        content: v.string()
    },
    handler: async(ctx,{sender,content})=>{
        await ctx.db.insert('messages',{sender,content})
    }
}) 