import {customCtx,customMutation,customQuery} from 'convex-helpers/server/customFunctions'
import {getCurrentUser} from './user'
import { mutation, query } from '../_generated/server'
//custom query are reusable functions that can be used to form other queries. The custom query would run first then
//any additional query being used on top of it.
export const authenticatedQuery = customQuery(query,customCtx(async(ctx)=>{
    const user = await getCurrentUser(ctx)
    if(!user){
        throw new Error('unauthorized')
    }
    return {user}
}))

export const authenticatedMutation = customMutation(mutation,customCtx(async(ctx)=>{
    const user = await getCurrentUser(ctx)
    if(!user){
        throw new Error('unauthorized')
    }
    return {user}
}))