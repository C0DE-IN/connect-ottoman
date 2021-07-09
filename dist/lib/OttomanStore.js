"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OttomanStore = void 0;
const express_session_1 = require("express-session");
const ottoman_1 = require("ottoman");
const noop = () => { };
class OttomanStore extends express_session_1.Store {
    client;
    collectionName;
    maxExpiry;
    prefix;
    constructor(options) {
        super();
        if (!options.client) {
            throw new Error('A client must be directly provided to the OttomanStore');
        }
        else {
            this.client = options.client;
        }
        this.prefix = options.prefix == null ? 'sess:' : options.prefix;
        this.maxExpiry = options.maxExpiry == null ? 18000 : options.maxExpiry;
        this.collectionName = options.collectionName == null ? '_default' : options.collectionName;
    }
    connectToOttoman() {
        const ottoman = this.client;
        if (ottoman.getModel('Session') === undefined) {
            const SessionModel = ottoman.model('Session', SessionSchema, {
                collectionName: this.collectionName,
                maxExpiry: this.maxExpiry,
            });
            ottoman.start();
            return SessionModel;
        }
        else {
            const SessionModel = ottoman.getModel('Session');
            ottoman.start();
            return SessionModel;
        }
    }
    get(sid, callback) {
        (async () => {
            try {
                const key = this.prefix + sid;
                const SessionModel = this.connectToOttoman();
                const result = await SessionModel.findOne({ id: key });
                callback(null, result.session);
            }
            catch (err) {
                callback(err);
            }
        })();
    }
    set(sid, session, callback = noop) {
        (async () => {
            try {
                const key = this.prefix + sid;
                const SessionModel = this.connectToOttoman();
                const createSession = new SessionModel({ id: key, session: session });
                await createSession.save();
            }
            catch (err) {
                callback(err);
            }
        })();
    }
    destroy(sid, callback = noop) {
        (async () => {
            try {
                const key = this.prefix + sid;
                const SessionModel = this.connectToOttoman();
                await SessionModel.removeById(key);
                callback(null);
            }
            catch (err) {
                callback(err);
            }
        })();
    }
    touch(sid, session, callback = noop) {
        ;
        (async () => {
            try {
                let key = this.prefix + sid;
                session.lastModified = new Date(Date.now());
                const SessionModel = this.connectToOttoman();
                const result = await SessionModel.findOneAndUpdate({ id: key }, { session: session });
                if (!result.id) {
                    return callback(new Error('Unable to find the session to touch'));
                }
                else {
                    return callback(null);
                }
            }
            catch (err) {
                callback(err);
            }
        })();
    }
    length(callback) {
        ;
        (async () => {
            try {
                const SessionModel = this.connectToOttoman();
                const result = await SessionModel.count({ id: { $like: '%' + this.prefix + '%' } });
                callback(null, result);
            }
            catch (err) {
                callback(err, 0);
            }
        })();
    }
    clear(callback = noop) {
        ;
        (async () => {
            try {
                const SessionModel = this.connectToOttoman();
                await SessionModel.removeMany({ id: { $like: '%' + this.prefix + '%' } });
                callback(null);
            }
            catch (err) {
                callback(err);
            }
        })();
    }
    all(callback) {
        ;
        (async () => {
            try {
                const SessionModel = this.connectToOttoman();
                const result = await SessionModel.find({ id: { $like: '%' + this.prefix + '%' } });
                callback(null, result);
            }
            catch (err) {
                callback(err);
            }
        })();
    }
}
exports.OttomanStore = OttomanStore;
const SessionSchema = new ottoman_1.Schema({
    id: { type: String, required: true },
    session: { type: ottoman_1.Schema.Types.Mixed, required: true },
});
SessionSchema.index.findOneById = {
    by: 'id',
    options: { limit: 1, select: 'session' },
    type: 'n1ql',
};
