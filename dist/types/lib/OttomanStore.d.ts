import session from 'express-session';
import { Ottoman } from 'ottoman';
export default class OttomanStore extends session.Store {
    client: connectOptions;
    collectionName: string;
    maxExpiry: number;
    prefix: string;
    constructor(options: OttomanStoreOptions);
    connectToOttoman(): {
        ottoman: Ottoman;
        SessionModel: import("ottoman").ModelTypes<any, any>;
    };
    get(sid: string, callback: (err: any, session?: session.SessionData | null) => void): void;
    set(sid: string, session: session.SessionData, callback?: (err: any) => void): void;
    destroy(sid: string, callback?: (err: any) => void): void;
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
export {};
