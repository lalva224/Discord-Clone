import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import {Webhook} from 'svix'
import { sign } from "crypto";
import { WebhookEvent } from "@clerk/nextjs/server";
import {internal} from './_generated/api'
//why convex over a normal backend
const http = httpRouter()

//webhooks are triggers that when triggered send data to another application. In this case from clerkjs to convex, upon signup.
http.route({
    method:'POST',
    path: '/clerk-webhook',
    //http action is a function that takes a context and a request and returns a response. Function is different in thsi way from regular async function
    handler: httpAction(async(ctx,req)=>{
        const body = await validateRequest(req)
        if (!body){
            //401? give some response code explanations
            return new Response('Unauthorized', {status:401})
        }
        //internal mutations are key because they are not accessible by frontend. This increases our security measures.
        switch(body.type){
            case 'user.created':
                await ctx.runMutation(internal.functions.user.upsert,{
                    username: body.data.username!,
                    image: body.data.image_url!,
                    clerkId : body.data.id!
                })
                break
            case 'user.updated':
                await ctx.runMutation(internal.functions.user.upsert,{
                    username: body.data.username!,
                    image: body.data.image_url!,
                    clerkId : body.data.id!
                })
                break
            case 'user.deleted':
                if(body.data.id){
                    await ctx.runMutation(internal.functions.user.remove,{
                        clerkId: body.data.id
                    })
                }
                break
        }
        return new Response('OK', {status:200})
    })
})

//how the webhook is validated: First the triggering event occurs, a new user is added,updated, or deleted. The webhook is triggered and relayed to svix with critical data such as id, timestamp, and signature. When verifying the request it is ensured that the svix information given by the triggering of the event matches with the request body. If it does not match, the request is unauthorized and a 401 status code is returned. If it does match, the request is authorized and the event is sent to convex.
// suppose a malicious entity sent a request to the webhook, once the event is triggered clerkjs sends the critical data. It is impossibel for the hacker to know this data so their request body will not match the svix data.
const validateRequest  = async(req:Request)=>{
    //what are these used for.
    const svix_id = req.headers.get('svix-id')
    const svix_timestamp = req.headers.get('svix-timestamp')
    const svix_signature = req.headers.get('svix-signature')
    const text = await req.text()
    try{
        //! means that this variable is not null and to not complain about it
        const webhook =  new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
        //explain this verfiication?
        // explain type coercion as type as unknown as WebhookEvent
        return webhook.verify(text,{
            "svix-id" : svix_id!,
            "svix-timestamp": svix_timestamp!,
            "svix-signature": svix_signature!
        })as unknown as  WebhookEvent
    }catch(e){
        return null
    }
}
export default http