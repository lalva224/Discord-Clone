import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        username: v.string(),
        image: v.string(),
        clerkId: v.string()
        //use indexing so we can quickly grab users, instead of performing linear search every time.
    }).index('by_clerkId', ['clerkId']),
    messages: defineTable({
        // v used to declare type and validate it
        sender: v.string(),
        content: v.string()
    })
})

//create users table and webhook. This webhook can sync user information from clerk into convex
