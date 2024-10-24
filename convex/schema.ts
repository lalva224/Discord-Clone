import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    messages: defineTable({
        // v used to declare type and validate it
        sender: v.string(),
        content: v.string()
    })
})