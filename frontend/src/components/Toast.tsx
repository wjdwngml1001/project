import { useEffect, useState } from 'react'

export default function Toast({ text }: { text: string }) {
  const [show, setShow] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1800)
    return () => clearTimeout(t)
  }, [])
  if (!show) return null
  return (
    <div style={{
      position:'fixed', bottom:18, left:'50%', transform:'translateX(-50%)',
      background:'#111', color:'#fff', padding:'10px 14px', borderRadius:8, fontSize:13
    }}>{text}</div>
  )
}
