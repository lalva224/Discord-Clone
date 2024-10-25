'use client'
import { Authenticated, Unauthenticated, useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { SignInButton } from "@clerk/nextjs";
// type vs interface: type is more expressive but it is closed, meaning u can't merge. interface is open, meaning you can add more properties to it
type  Message = {
  sender: string
  content: string
}

export default function Home() {
  //api allows us to access functions created in the server. functions is folder, message is file, list is function
  const messages = useQuery(api.functions.message.list)
  const createMessage = useMutation(api.functions.message.create)
  const [input,setInput] = useState<string>("")

  // how am i supposed to figure out this form type?
  const handleSubmit = (e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault()
    //we are alice for now, but as we sign into different accounts it can change.
    createMessage({sender: "Alice",content: input})
    }
  return (
   <>
  <Authenticated>
   {
    // ? optional chaining. if messages is null, null.map will give me an error, this way we prevent that.
    messages?.map((message,index)=>(
      <div key={index}>
        <strong>{message.sender}</strong> : {message.content}
      </div>
     ))
   }
   
   <form onSubmit={handleSubmit}>
    {/**name is the key that is sent to the server. */}
    {/**setting value is important, bc say we want to clear field or use validation, we can't do that without having control of the value.*/}
    <input type = 'text' name= 'message' id ='message' value = {input} onChange={(e)=>setInput(e.target.value)}/>
    {/**type submit is a trigger for forms to submit to DB while reset, resets the form.*/}
    <button type = 'submit'>Send</button>
   </form>

   </Authenticated>
   <Unauthenticated>
    <SignInButton/>
   </Unauthenticated>
   </>
  );
}
