export default function BlockChip({ label, onClick }:{label:string; onClick?:()=>void}) {
  return (
    <button className="chip-compact" onClick={onClick}>{label}</button>
  )
}
