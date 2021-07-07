import { OttomanStore } from './lib/OttomanStore'
import session from 'express-session'
export default (_session: typeof session) => {
  return OttomanStore
}

