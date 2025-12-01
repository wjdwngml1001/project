// C:\project\frontend\src\api\teacher.ts
import { get, post, csvUrl } from './http'

export const TeacherAPI = {
  snapshot(classId = '3A') {
    return get(`/api/classes/${classId}/snapshot`)
  },
  logsCsvHref(classId = '3A') {
    return csvUrl(`/api/classes/${classId}/logs.csv`)
  },
  saveProject(classId: string, sid: string, project: any) {
    return post(`/api/classes/${classId}/students/${sid}/project`, project)
  },
  fetchProject(classId: string, sid: string) {
    return get(`/api/classes/${classId}/students/${sid}/project`)
  }
}
