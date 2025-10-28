type Item = { label: string; value: number }
export default function SimpleBarChart({ data, maxHeight=80 }:{ data: Item[]; maxHeight?: number }) {
  const max = Math.max(1, ...data.map(d=>d.value))
  return (
    <div style={{display:'flex', alignItems:'end', gap:8, height:maxHeight}}>
      {data.map((d,i)=>(
        <div key={i} style={{textAlign:'center'}}>
          <div style={{
            width: 22,
            height: Math.round((d.value / max) * (maxHeight-20)),
            background:'#60a5fa',
            borderRadius:6
          }} title={`${d.label}: ${d.value}`} />
          <div style={{fontSize:10, marginTop:4}}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}
