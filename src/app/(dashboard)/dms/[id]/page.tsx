'use client'
import { useMutation, useQuery } from 'convex/react'
import {use, useState } from 'react'
import { api } from '../../../../../convex/_generated/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVerticalIcon, SendIcon, TrashIcon } from 'lucide-react'
import { Doc, Id } from '../../../../../convex/_generated/dataModel'
import { FunctionReturnType } from 'convex/server'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
//although we aren't importing export default says this is the main file to be displayed.
//params? Why not create a params type?
export default function MessagePage({params}:{params:Promise<{id:Id<'directMessages'>}>}) {
    //use is a react hook that allows us to access the value of the promise

    //use allows for asynchronous data fetching. But why not just get data after the promise.
    const {id}  = use(params)
    
    //what is the 2nd param id??
    const directMessage = useQuery(api.functions.dm.get,{id})
    const messages = useQuery(api.functions.message.list,{directMessage:id})
    if (!directMessage){
        return null
    }
    return (
        <div className='flex flex-1 flex-col divide-y max-h-screen'>
            <header className='flex items-center gap-2 p-4'>
            <Avatar className='size-8 border'>
                <AvatarImage src={directMessage.user.image}/>
                <AvatarFallback/>
            </Avatar>
            <h1 className='font-semibold'>{directMessage.user.username}</h1>
            </header>
            {/**how doss this look? */}
            <ScrollArea className='h-full py-4'>
            {messages?.map((message)=><MessageItem key={message._id} message={message}/>)}
            <MessageInput directMessage={id}/>
            </ScrollArea>
            
            
        </div>
    )
    
}

//what is this type????
type Message = FunctionReturnType<typeof api.functions.message.list>[number]

function MessageItem({message}:{message:Message}){
    const user = useQuery(api.functions.user.get)

    return (
        <div className='flex items-center px-4 gap-2 py-2'>
            <Avatar className='size-8 border'>
              { message.sender && <AvatarImage  src ={message.sender?.image}/>}
                <AvatarFallback/>
            </Avatar>
            {/** mr-auto? When to use this over flex-end?*/}
            <div className='flex flex-col mr-auto'>
                {/**?? means if first value is null then continue to 2nd value */}
                <p className='text-xs text-muted-foreground'>{message.sender?.username ?? 'Deleted USer'}</p>
                <p className='text-sm'>{message.content}</p>
            </div>
            <MessageActions message ={message} />
        </div>
    )
}

function MessageActions({message}:{message:Message}){
    const user = useQuery(api.functions.user.get)
    const removeMutation = useMutation(api.functions.message.remove)
    if(!user || message.sender?._id!==user._id){
        return null
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                {/** 3 dots* */}
                <MoreVerticalIcon className='size-4 text-muted-foreground'/>
                <span className='sr-only'> Message Actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {/**this makes text red. Why not text-red-500 ? */}
                <DropdownMenuItem className='text-destructive' onClick={()=>removeMutation({id:message._id})}>
                    <TrashIcon/>
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function MessageInput({directMessage}:{directMessage:Id<'directMessages'>}){  
    const [content,setContent] = useState('')
    const sendMessage = useMutation(api.functions.message.create)

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        try{
            await sendMessage({directMessage,content})
            setContent('')
        }
        catch(error){
            toast.error('Failed to send message')
        }
    }
    return (
        <form className='flex items-center p-4 gap-2' onSubmit={handleSubmit}>
        <Input placeholder='Message' value={content} onChange={(e)=>setContent(e.target.value)}/>
        <Button size='icon'>
        <SendIcon/>
        <span className='sr-only'>Send</span>
        </Button>
        </form>
    )
} 