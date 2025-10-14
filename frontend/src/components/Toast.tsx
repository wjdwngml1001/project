import { useEffect, useState } from 'react'
export default function Toast({text}:{text:string}) {
  const [show,setShow]=useState(true)
  useEffect(()=>{ const t=setTimeout(()=>setShow(false),2500); return ()=>clearTimeout(t) },[])
  if(!show) return null
  return <div className="toast">{text}</div>
}
