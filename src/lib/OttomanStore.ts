import session from 'express-session'
import { Ottoman, Schema } from 'ottoman'

export default (_session: typeof session) => {
  const noop = () => { }
  class OttomanStore extends _session.Store {
    client: connectOptions
    collectionName: string
    maxExpiry: number
    prefix: string

    constructor(options: OttomanStoreOptions) {
      super()
      if (!options.client) {
        throw new Error('A client must be directly provided to the OttomanStore');
      } else {
        this.client = options.client
      }
      this.prefix = options.prefix == null ? 'sess:' : options.prefix
      this.maxExpiry = options.maxExpiry == null ? 18000 : options.maxExpiry
      this.collectionName = options.collectionName == null ? '_default' : options.collectionName
    }

    connectToOttoman() {
      const ottoman = new Ottoman()
      ottoman.connect(this.client)
      const SessionModel = ottoman.model('Session', SessionSchema, {
        collectionName: this.collectionName,
        maxExpiry: this.maxExpiry,
      })

      return { ottoman, SessionModel }
    }

    get(sid: string, callback: (err: any, session?: session.SessionData | null) => void): void {
      (async () => {
        try {
          const key = this.prefix + sid
          const { ottoman, SessionModel } = this.connectToOttoman()
          ottoman.start()
          const result = await SessionModel.findOne({ id: key })
          ottoman.close()
          callback(null, result.session)
        } catch (err) {
          callback(err)
        }
      })()
    }

    set(sid: string, session: session.SessionData, callback: (err: any) => void = noop): void {
      (async () => {
        try {
          const key = this.prefix + sid
          const { ottoman, SessionModel } = this.connectToOttoman()
          ottoman.start()
          const createSession = new SessionModel({ id: key, session: session })
          await createSession.save()
          ottoman.close()
        } catch (err) {
          callback(err)
        }
      })()
    }

    destroy(sid: string, callback: (err: any) => void = noop): void {
      (async () => {
        try {
          const key = this.prefix + sid
          const { ottoman, SessionModel } = this.connectToOttoman()
          ottoman.start()
          await SessionModel.removeById(key)
          ottoman.close()
          callback(null)
        } catch (err) {
          callback(err)
        }
      })()
    }
  }
  return OttomanStore
}

interface OttomanStoreOptions {
  client?: connectOptions;
  collectionName?: string;
  maxExpiry?: number;
  prefix?: string;
}
interface connectOptions {
  connectionString: string;
  bucketName: string;
  username: string;
  password: string;
}
const SessionSchema = new Schema({
  id: { type: String, required: true },
  session: { type: Schema.Types.Mixed, required: true },
});

SessionSchema.index.findOneById = {
  by: 'id',
  options: { limit: 1, select: 'session' },
  type: 'n1ql',
}
SessionSchema.index.findOneByUserId = {
  by: 'session.userId',
  options: { limit: 1, select: 'session' },
  type: 'n1ql',
}