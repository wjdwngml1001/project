export type PlanRes = {
  tasks: {id:string;text:string}[]
  suggestions: {block:string; params:any[]}[]
  intentLogId: string
}

export async function plan(nl: string, level: 'A'|'B'): Promise<PlanRes> {
  const hasHello = /안녕|hello/i.test(nl)
  const stepsMatch = nl.match(/(\d+)\s*칸/)
  const stepsBase = stepsMatch ? Number(stepsMatch[1]) : 3
  const steps = stepsBase * 10

  const basic = [
    {id:'t1', text:'시작(깃발) 블록 배치'},
    {id:'t2', text:`앞으로 ${stepsBase}칸 이동 블록 연결`}
  ]
  const advanced = level==='B'
    ? [{id:'tX', text:'키보드 스페이스 조건 추가(선택)'}] : []

  return {
    tasks: [...basic, {id:'t3', text:`"${hasHello?'안녕':'말풍선'}" 말하기(2초)`}, ...advanced],
    suggestions: [
      {block:'when_start', params:[]},
      {block:'move_steps', params:[steps]},
      {block:'say', params:[hasHello?'안녕':'좋아!', 2]},
    ],
    intentLogId: 'pln_'+Math.random().toString(36).slice(2,8)
  }
}

export async function teacherOverview() {
  const thumbs = Array.from({length:25}).map((_,i)=>({
    studentId:'S'+String(i+1).padStart(2,'0'),
    status: i%7===0?'err':(i%5===0?'slow':'ok'),
    screen: i%3===0?'dashboard':'code'
  }))
  return {
    thumbnails: thumbs,
    misconceptions: [
      {type:'repeat_missing', count:12},
      {type:'coord_confused', count:8},
      {type:'empty_if', count:5}
    ]
  }
}
