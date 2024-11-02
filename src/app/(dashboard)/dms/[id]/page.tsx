'use client'
import { useMutation, useQuery } from 'convex/react'
import {use, useEffect, useRef, useState } from 'react'
import { api } from '../../../../../convex/_generated/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LoaderIcon, MoreVerticalIcon, PlusIcon, SendIcon, TrashIcon } from 'lucide-react'
import { Doc, Id } from '../../../../../convex/_generated/dataModel'
import { FunctionReturnType } from 'convex/server'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'
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
            <TypingIndicator directMessage={id}/>
            <MessageInput directMessage={id}/>
            </ScrollArea>
            
            
        </div>
    )
    
}

function TypingIndicator({directMessage}:{directMessage:Id<'directMessages'>}){
    const usernames = useQuery(api.functions.typing.list,{directMessage})
    if (!usernames || usernames.length==0){
        return null
    }
    return <div className="text-sm text-muted-foreground px-4 py-2">
        {usernames.length==1 ? `${usernames[0]} is typing...` :
        `${usernames.join(', ')} are typing...`}
    </div>
}
//what is this type????
type Message = FunctionReturnType<typeof api.functions.message.list>[number]

function MessageItem({message}:{message:Message}){
    const user = useQuery(api.functions.user.get)
    useEffect(()=>{
        console.log(message.attachment)
    },[message])
   
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
                {/**look into this css **/}
                {message.attachment &&(
                 <Image src = {message.attachment} alt ='Attachment' width={300} height={300} className='rounded border overflow-hidden'/>)
                }
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
    const sendTypingIndicator = useMutation(api.functions.typing.upsert)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const generateUploadUrl = useMutation(api.functions.message.generateUploadUrl)
    //really dig in and understand Id and Doc types
    const [attachment,setAttachment] = useState<Id<'_storage'>>()
    const [file,setFile] = useState<File>()
    const [isUploading,setIsUploading] = useState(false)
    const handleImageUpload = async(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file = e.target.files?.[0]
        if(!file) return 
        
        setFile(file)
        
        setIsUploading(true)
        const url = await generateUploadUrl()
       
        //we grab the generate upload url and then we send the file to that url
        const res = await fetch(url,{
            method : 'POST',
            body:file
        })
        //is this amount of ts syntax really necessary?
        const {storageId} = (await res.json()) as {storageId:Id<'_storage'>}
       
        setAttachment(storageId)
        setIsUploading(false)
    }
    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        try{
            console.log(attachment)
            await sendMessage({directMessage,attachment,content})
            setContent('')
            setAttachment(undefined)
            setFile(undefined)
        }
        catch(error){
            toast.error('Failed to send message')
        }
    }
    return (
        <>
        {/**items-end? */}
        <form className='flex items-end p-4 gap-2' onSubmit={handleSubmit}>
            {/**onKeydown means when the key is pressed. Here we use useState variabe by getting e.target.value. There was another example using currentTarget, check that out. */}
            {/**type Submit is default behavior. type button means mean we click the button we don't want to submit form. */}
            <Button
             type = 'button'
             size='icon' onClick={()=>{
                console.log('clicked')
                fileInputRef.current?.click()
            }}>
                <PlusIcon/>
                <span className='sr-only'>Add Attachment</span>
            </Button>
        <div className="flex flex-col flex-1 gap-2">
            {file  && (
                <ImagePreview
                file={file}
                isUploading = {isUploading}
                />
            )}
            <Input placeholder='Message' value={content} onChange={(e)=>setContent(e.target.value)} onKeyDown={()=>{
                if(content.length > 0){
                    sendTypingIndicator({directMessage})
                }
            }}/>
            </div>
        <Button size='icon'>
        <SendIcon/>
        <span className='sr-only'>Send</span>
        </Button>
        </form>

        <input type="file" className="hidden"  ref={fileInputRef} onChange={handleImageUpload}/>
        </>
    )
}
    {/**look into how preview works */}
function ImagePreview({file,isUploading}:{file:File,isUploading:boolean}){
    
    return (
        <>
        {/**position relative? */}
        <div className='relative size-40 overflow-hidden rounded border'>
        {/*/what does createObject Url do?* */}
        <Image src = {URL.createObjectURL(file)} alt ='Attachment' width={300} height={300} />
        {isUploading && (
            //look into this css
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                {/**how this only run when loading? */}
                <LoaderIcon className='animate-spin size-8'/>
            </div>
        )}
        </div>
        </>

    )
}
