import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AvatarImage } from "@radix-ui/react-avatar"
import { CheckIcon, MessageCircleIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"
import React from "react"
const useTestUsers = ()=>{
    const user = useQuery(api.functions.user.get)
    if (!user){
        return []
    }

    return [user,user,user]
}

export function PendingFriendsList(){
    const friends = useQuery(api.functions.friend.listPending)
    const updateStatus = useMutation(api.functions.friend.updateStatus)
    return (
        <div className="flex flex-col divide-y">
            {/** muted-foregorund? */}
            <h2 className="text-xs font-medium text-muted-foreground p-2.5">Pending Friends</h2>
            {friends?.length==0 && <FriendslistEmpty>No pending friend requests</FriendslistEmpty>}
            {
                friends?.map((friend,index)=>(
                    <FriendItem key={index} username={friend.user.username} image={friend.user.image}>
                        <IconButton title = 'Accept Friend' icon = {<CheckIcon/>} className="bg-green-100" onClick={()=>updateStatus({id:friend._id,status:'accepted'})}/>
                        <IconButton title = 'Reject Friend' icon = {<XIcon/>} className="bg-red-100" onClick={()=>updateStatus({id:friend._id,status:'rejected'})}/>
                    </FriendItem>
                ))
            }
        </div>
    )
}
export function AcceptedFriendsList(){
    const friends = useQuery(api.functions.friend.listAccepted)
    const updateStatus = useMutation(api.functions.friend.updateStatus)
    return (
        <div className="flex flex-col divide-y">
            
            <h2 className="text-xs font-medium text-muted-foreground p-2.5">Accepted Friends</h2>
            {friends?.length==0 && <FriendslistEmpty>No friends yet</FriendslistEmpty>}
            {
               //if length is 0 then nothing here is rendered, but nofriendslist is rendered
                friends?.map((friend,index)=>(
                    <FriendItem key={index} username={friend.user?.username} image={friend.user?.image}>
                        <IconButton title = 'Start DM' icon={<MessageCircleIcon/>} onClick={()=>{}}/>
                        <IconButton title = 'Remove Friend' icon={<XIcon/>} className='bg-red-100' onClick={()=>updateStatus({id:friend._id,status:'rejected'})}/>
                        
                    </FriendItem>
                    
                ))
            }
        </div>
    )
}

function FriendslistEmpty({children}:{children:React.ReactNode}){
    //what is muted doing? /50 is a 50% opacity? what is text-muted-foreground?
    return (
      
        <div className="p-4 bg-muted/50 text-center text-sm text-muted-foreground">{children}</div>
    )
}
function IconButton({title,className,icon, onClick}:{title:string,className?:string,icon:React.ReactNode,onClick:()=>void}){
    return(
        <Tooltip>
            <TooltipTrigger asChild>
                {/**cn is a merger for class names, by shadcn */}
                <Button className={cn('rounded-full',className)} variant='outline' size='icon' onClick={onClick}>
                    {icon}
                    <span className="sr-only">{title}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-sm text-white p-1.5 rounded">{title}</TooltipContent>
        </Tooltip>
    )
}
function FriendItem({username,image,children}:{username:string,image:string,children?:React.ReactNode}){
    return (
      
        <div className="flex items-center justify-between p-2.5 gap-2.5 ">
            <div className="flex items-center gap-2.5">
            <Avatar className="size-9 border">
                <AvatarImage src = {image}/>
                <AvatarFallback/>
                </Avatar>
                <p className="text-sm font-medium">{username}</p>
                </div>
                <div className='flex items-center gap-1'>{children}</div>
               
        </div>
        
    )
}