import session, { Store } from 'express-session'
import { Ottoman, Schema } from 'ottoman'

const noop = () => { }

export class OttomanStore extends Store {
  client: Ottoman;
  sessionSchema:Schema;
  scopeName:string;
  collectionName: string;
  modelName:string;
  maxExpiry: number;
  prefix: string;
  SessionModel: any;

  constructor(options: OttomanStoreOptions) {
    super()
    if (!options.client) {
      throw new Error('A client must be directly provided to the OttomanStore');
    } else {
      this.client = options.client
    }
    
    this.scopeName = options.scopeName == null ? '_default' : options.scopeName
    this.collectionName = options.collectionName == null ? '_default' : options.collectionName
    this.sessionSchema = options.sessionSchema == null ? SessionSchema : options.sessionSchema
    this.modelName = options.modelName == null ? 'Session' : options.modelName
    this.prefix = options.prefix == null ? 'sess:' : options.prefix
    this.maxExpiry = options.maxExpiry == null ? 18000 : options.maxExpiry

    if (this.client.getModel(this.modelName) === undefined) {
      this.SessionModel = this.client.model(this.modelName, this.sessionSchema, {
        scopeName: this.scopeName,
        collectionName: this.collectionName,
        maxExpiry: this.maxExpiry
      })
    } else {
      this.SessionModel = this.client.getModel(this.modelName)
    }
  }  

  get(sid: string, callback: (err: any, session?: session.SessionData | null) => void): void {
    (async () => {
      try {
        const key = this.prefix + sid
        const result = await this.SessionModel.findOne({ id: key })
        callback(null, result.session)
      } catch (err) { callback(err) }
    })()
  }

  set(sid: string, session: session.SessionData, callback: (err: any) => void = noop): void {
    (async () => {
      try {
        const key = this.prefix + sid
        const createSession = new this.SessionModel({ id: key, session: session })
        await createSession.save()
      } catch (err) { callback(err) }
    })()
  }

  destroy(sid: string, callback: (err: any) => void = noop): void {
    (async () => {
      try {
        const key = this.prefix + sid
        await this.SessionModel.removeById(key)
        callback(null)
      } catch (err) { callback(err) }
    })()
  }

  touch(sid: string,
    session: session.SessionData & { lastModified?: Date },
    callback: (err: any) => void = noop) {
    ; (async () => {
      try {
        let key = this.prefix + sid
        session.lastModified = new Date(Date.now())
        const result = await this.SessionModel.findOneAndUpdate({ id: key }, { session: session })
        if (!result.id) {
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
       
        const result = await this.SessionModel.count({ id: { $like: '%' + this.prefix + '%' } })
        callback(null, result)
      }
      catch (err) { callback(err, 0) }
    })()
  }

  clear(callback: (err: any) => void = noop): void {
    ; (async () => {
      try {

        await this.SessionModel.removeMany({ id: { $like: '%' + this.prefix + '%' } })

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
        const result = await this.SessionModel.find({ id: { $like: '%' + this.prefix + '%' } })
        callback(null, result)
      } catch (err) { callback(err) }
    })()
  }
}

export interface OttomanStoreOptions {
  client?: Ottoman;
  scopeName?:string;
  collectionName?: string;
  sessionSchema?: Schema;
  modelName?:string;
  maxExpiry?: number;
  prefix?: string;
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