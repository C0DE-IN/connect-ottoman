import { SessionData, Store } from 'express-session';
import { Ottoman, Schema } from 'ottoman';

interface OttomanStoreOptions {
  client: Ottoman; // Ensure the client is a required option
  sessionSchema?: Schema; // Make sessionSchema optional
  scopeName?: string;
  collectionName?: string;
  modelName?: string;
  maxExpiry?: number;
  prefix?: string;
}

class OttomanStore extends Store {
  client: Ottoman;
  sessionSchema: Schema | undefined; // Initialize sessionSchema as optional
  scopeName: string;
  collectionName: string;
  modelName: string;
  maxExpiry: number;
  prefix: string;
  SessionModel?: any;

  constructor(options: OttomanStoreOptions) {
    super();
    this.client = options.client;
    this.scopeName = options.scopeName ?? '_default'; // Use nullish coalescing operator for default values
    this.collectionName = options.collectionName ?? '_default';
    this.sessionSchema = options.sessionSchema;
    this.modelName = options.modelName ?? 'Session';
    this.prefix = options.prefix ?? 'sess:';
    this.maxExpiry = options.maxExpiry ?? 86400000;

    // Ensure SessionModel is initialized before usage
    this.SessionModel = this.client.getModel(this.modelName) ||
      this.client.model(this.modelName, this.sessionSchema || SessionSchema, {
        scopeName: this.scopeName,
        collectionName: this.collectionName,
        maxExpiry: this.maxExpiry
      });
  }

  async get(sid: string, callback: (err: any, session?: SessionData | null) => void): Promise<void> {
    const key = this.prefix + sid;
    try {
      const sess = await this.SessionModel.findById(key);
      console.log('get try', key);
      callback(null, sess.session);
    } catch (err) {
      console.log('get catch', key);
      callback(err);
    }
  }

  async set(sid: string, session: SessionData, callback?: (err?: any) => void): Promise<void> {
    const key = this.prefix + sid;
    try {
      await this.SessionModel.create({ id: key, session: session });
      console.log('set try', key);
      callback?.();
    } catch (err) {
      console.log('set catch', key);
      callback?.(err);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void): Promise<void> {
    const key = this.prefix + sid;
    try {
      await this.SessionModel.removeById(key);
      console.log('destroy try', key);
      callback?.();
    } catch (err) {
      console.log('destroy catch', key);
      callback?.(err);
    }
  }

  async touch(sid: string, session: SessionData, callback?: () => void): Promise<void> {
    const key = this.prefix + sid;
    try {
      await this.SessionModel.updateById(key, { session: session }, { new: true, upsert: true });
      console.log('touch try', key);
      callback?.();
    } catch (err) {
      console.log('touch catch');
      callback?.();
    }
  }

  async clear(callback?: (err?: any) => void): Promise<void> {
    try {
      await this.SessionModel.removeMany({ name: { $like: '%*%' } });
      console.log('clear try');
      callback?.();
    } catch (err) {
      console.log('clear catch');
      callback?.(err);
    }
  }
}

export const SessionSchema = new Schema({
  id: { type: String, required: true },
  session: { type: Schema.Types.Mixed, required: true },
});

export default OttomanStore;
