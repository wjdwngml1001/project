export default function BlockChip({label, onAdd}:{label:string; onAdd:()=>void}) {
  return <button className="badge" onClick={onAdd} style={{cursor:'pointer'}}>{label} ⊕</button>
}
