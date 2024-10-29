import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        username: v.string(),
        image: v.string(),
        clerkId: v.string()
        //use indexing so we can quickly grab users, instead of performing linear search every time.
    }).index('by_clerkId', ['clerkId']).index('by_username', ['username']),
    messages: defineTable({
        // v used to declare type and validate it
        sender: v.string(),
        content: v.string()
    }),
    friends: defineTable({
        //used to validate if this is actually a user
        //we will have user sending and receiving in this case, the friend request, acceptance, rejection, DM, or removal of friendship.
        //the id is the primary key created for each table, if not expliclty defined convex creates one using UUID
       user_sending: v.id('users'),
       user_receiving: v.id('users'),
       //literal is value that cannot be changed. Union means this value can be any of these literals.
       status: v.union(v.literal('pending'),v.literal('accepted'),v.literal('rejected'))
       //index as a tuple like (1234,'pending') etc for userid and status
    }).index('by_user_sending_status', ['user_sending','status']).index('by_user_receiving_status', ['user_receiving','status']),

    //analyze a bit more
    directMessages : defineTable({}),
    directMessageMembers: defineTable({
        directMessage : v.id('directMessages'),
        user: v.id('users')
    }).index('by_dm',['directMessage']).index('by_dm_user',['directMessage','user']).index('by_user', ['user'])
})

//create users table and webhook. This webhook can sync user information from clerk into convex
