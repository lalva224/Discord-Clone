//provider connects convex to front-end
'use client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

//! tels our ts compiler that this variable is not null and to not complain about it
//the convex react client fetches our convex database and allows us to connect it to a react front end
const client = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
export function ConvexClientProvider({children}:{children:React.ReactNode}){
    //we can pass children as a prop, this way regardless of its datatype we are accepting it. children in this case will be content of entire app
    //so we essentially wrap content of entire app with this context provider, which as client connected to convex database.
    return <ConvexProvider client = {client}>{children}</ConvexProvider>
}