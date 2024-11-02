import { v } from "convex/values";
import { authenticatedMutation, authenticatedQuery } from "./helpers";
import { QueryCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

//get all dms from every user
//getDirectMessage is just returning the dm doc and the other user involved in dm. How will this be used? Why not the entire object?
export const list = authenticatedQuery({
  handler: async (ctx) => {
    const directMessages = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_user", (q) => q.eq("user", ctx.user._id))
      .collect();
    //Promise.all() bc fetching from apis one at a time would introduce latency, we
    //are we getting directMessages from the directMessageMembers table?
    return await Promise.all(
      directMessages.map((dm) => getDirectMessage(ctx, dm.directMessage))
    );
  },
});

//get dms by user
export const get = authenticatedQuery({
  args: {
    id: v.id("directMessages"),
  },
  handler: async (ctx, { id }) => {
    //unique throws an error if there is more than one result, first() returns only the first result, take(n) returns n results in a collection. Collect gets all the results.
    const member = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_dm_user", (q) =>
        q.eq("directMessage", id).eq("user", ctx.user._id)
      )
      .first();

    if (!member) {
      throw new Error("You are not a member of this direct message");
    }
    return getDirectMessage(ctx, id);
  },
});
//create a dm under a user
//how does this work? If we find a DM return it and if not create a DM? How would new DMS be created?
export const create = authenticatedMutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    if (!user) {
      throw new Error("User does not exist");
    }
    const directMessagesForCurrentUser = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_user", (q) => q.eq("user", ctx.user._id))
      .collect();

    const directMessagesForOtherUser = await ctx.db
      .query("directMessageMembers")
      .withIndex("by_user", (q) => q.eq("user", user._id))
      .collect();

    //find overlap between other user and current user. Wouldnt it be easier to have created the schema with pairs in dm table, similar to friends table user1 and user2?
    const directMessage = directMessagesForCurrentUser.find((dm) =>
      directMessagesForOtherUser.find(
        (dm2) => dm.directMessage === dm2.directMessage
      )
    );

    if (directMessage) {
      return directMessage.directMessage;
    }

    const newDirectMessage = await ctx.db.insert("directMessages", {});
    await Promise.all([
      ctx.db.insert("directMessageMembers", {
        user: ctx.user._id,
        directMessage: newDirectMessage,
      }),
      ctx.db.insert("directMessageMembers", {
        user: user._id,
        directMessage: newDirectMessage,
      }),
    ]);
    return newDirectMessage;
  },
});

//helper function to get a direct message
/**
 * 
 * This is what direct message table looks like:
 * directMessageMembers Table:
| ID  | directMessage | user   |
|-----|---------------|--------|
| 1   | dm1           | userA  |
| 2   | dm1           | userB  |
| 3   | dm1           | userC  |
| 4   | dm2           | userA  |

users Table created by convex:
+--------+----------+---------------------------------------+
| id     | username | image                                 |
+--------+----------+---------------------------------------+
| userA  | Alice    | http://example.com/alice.png         |
| userB  | Bob      | http://example.com/bob.png           |
| userC  | Charlie  | http://example.com/charlie.png       |
+--------+----------+---------------------------------------+

Direct Messages Table:
+-------------------------+-------------------------+-------------------------+
| id                      | createdAt              | updatedAt              |
+-------------------------+-------------------------+-------------------------+
| dm1                     | 2024-01-01T12:00:00Z   | 2024-01-02T12:00:00Z   |
| dm2                     | 2024-01-03T12:00:00Z   | 2024-01-04T12:00:00Z   |
| dm3                     | 2024-01-05T12:00:00Z   | 2024-01-06T12:00:00Z   |
+-------------------------+-------------------------+-------------------------+

 */
const getDirectMessage = async (
  ctx: QueryCtx & { user: Doc<"users"> },
  id: Id<"directMessages">
) => {
  //we are getting a DM id, so it will get the DM document by its id
  const dm = await ctx.db.get(id);
  if (!dm) {
    throw new Error("Direct message does not exist");
  }
  //find the current dm member entry by the dm id and filtering out the current user id.
  // Result:  we get an entry with dm id and user id of the other member
  const otherMember = await ctx.db
    .query("directMessageMembers")
    .withIndex("by_dm", (q) => q.eq("directMessage", id))
    .filter((q) => q.neq(q.field("user"), ctx.user._id))
    .first();

  if (!otherMember) {
    throw new Error("Direct message has no other members");
  }
  //get retrieves db record by its id. Here we just get the user id of the the other member
  const user = await ctx.db.get(otherMember.user);
  if (!user) {
    throw new Error("Other member does not exist.");
  }
  return {
    ...dm,
    user,
  };
};
