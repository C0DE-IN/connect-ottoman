import { SessionData, Store } from 'express-session';
import { Ottoman, Schema } from 'ottoman';
interface OttomanStoreOptions {
    client: Ottoman;
    sessionSchema?: Schema;
    scopeName?: string;
    collectionName?: string;
    modelName?: string;
    maxExpiry?: number;
    prefix?: string;
}
declare class OttomanStore extends Store {
    client: Ottoman;
    sessionSchema: Schema | undefined;
    scopeName: string;
    collectionName: string;
    modelName: string;
    maxExpiry: number;
    prefix: string;
    SessionModel?: any;
    constructor(options: OttomanStoreOptions);
    get(sid: string, callback: (err: any, session?: SessionData | null) => void): Promise<void>;
    set(sid: string, session: SessionData, callback?: (err?: any) => void): Promise<void>;
    destroy(sid: string, callback?: (err?: any) => void): Promise<void>;
    touch(sid: string, session: SessionData, callback?: () => void): Promise<void>;
    clear(callback?: (err?: any) => void): Promise<void>;
}
export declare const SessionSchema: Schema;
export default OttomanStore;
