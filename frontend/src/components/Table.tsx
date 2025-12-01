export default function Table({ columns, rows }:{
  columns: { key:string; label:string; width?:number|string }[],
  rows: any[]
}) {
  return (
    <div style={{border:'1px solid #e5e7eb', borderRadius:8, overflow:'hidden', background:'#fff'}}>
      <div style={{display:'grid', gridTemplateColumns: columns.map(c=>c.width||'1fr').join(' '),
        background:'#f8fafc', borderBottom:'1px solid #e5e7eb', fontSize:13, fontWeight:600}}>
        {columns.map((c,i)=>(
          <div key={i} style={{padding:'8px 10px'}}>{c.label}</div>
        ))}
      </div>
      <div>
        {rows.map((r,i)=>(
          <div key={i} style={{display:'grid', gridTemplateColumns: columns.map(c=>c.width||'1fr').join(' '),
            borderBottom:'1px solid #f1f5f9', fontSize:13}}>
            {columns.map((c,j)=>(
              <div key={j} style={{padding:'8px 10px'}}>{String(r[c.key] ?? '')}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
