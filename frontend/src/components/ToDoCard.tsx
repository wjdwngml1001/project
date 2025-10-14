export default function ToDoCard({text, done=false}:{text:string;done?:boolean}) {
  return (
    <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <div>{text}</div>
      <div className="badge" style={{background: done?'#dcfce7':'#f1f5f9'}}>
        {done ? '완료' : '진행'}
      </div>
    </div>
  )
}
