import session, { Store } from 'express-session'
import { Ottoman, Schema } from 'ottoman'

const noop = () => { }

export class OttomanStore extends Store {
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

  touch(sid: string,
    session: session.SessionData & { lastModified?: Date },
    callback: (err: any) => void = noop) {
    ; (async () => {
      try {
        let key = this.prefix + sid
        session.lastModified = new Date(Date.now())
        const { ottoman, SessionModel } = this.connectToOttoman()
        ottoman.start()
        const result = await SessionModel.findOneAndUpdate({ id: key }, { session: session })
        ottoman.close()
        if (result.length === 0) {
          return callback(new Error('Unable to find the session to touch'))
        } else {
          return callback(null)
        }
      } catch (err) { callback(err) }
    })()
  }

  length(callback: (err: any, length: number) => void): void {
    ; (async () => {
      try {
        const { ottoman, SessionModel } = this.connectToOttoman()
        ottoman.start()
        const result = await SessionModel.count({ id: { $like: '%' + this.prefix + '%' } })
        ottoman.close()
        callback(null, result)
      }
      catch (err) { callback(err, 0) }
    })()
  }

  clear(callback: (err: any) => void = noop): void {
    ; (async () => {
      try {
        const { ottoman, SessionModel } = this.connectToOttoman()
        ottoman.start()
        await SessionModel.removeMany({ id: { $like: '%' + this.prefix + '%' } })
        ottoman.close()
        callback(null)
      } catch (err) { callback(err) }
    })()
  }

  all(
    callback: (
      err: any,
      obj?:
        | session.SessionData[]
        | { [sid: string]: session.SessionData }
        | null
    ) => void
  ): void {
    ; (async () => {
      try {
        const { ottoman, SessionModel } = this.connectToOttoman()
        ottoman.start()
        const result = await SessionModel.find({ id: { $like: '%' + this.prefix + '%' } })
        ottoman.close()
        callback(null, result)
      } catch (err) { callback(err) }
    })()
  }
}


export interface OttomanStoreOptions {
  client?: connectOptions;
  collectionName?: string;
  maxExpiry?: number;
  prefix?: string;
}
export interface connectOptions {
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