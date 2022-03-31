"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OttomanStore = void 0;
const express_session_1 = require("express-session");
const ottoman_1 = require("ottoman");
const noop = () => { };
class OttomanStore extends express_session_1.Store {
    client;
    sessionSchema;
    scopeName;
    collectionName;
    modelName;
    maxExpiry;
    prefix;
    SessionModel;
    constructor(options) {
        super();
        if (!options.client) {
            throw new Error('A client must be directly provided to the OttomanStore');
        }
        else {
            this.client = options.client;
        }
        this.scopeName = options.scopeName == null ? '_default' : options.scopeName;
        this.collectionName = options.collectionName == null ? '_default' : options.collectionName;
        this.sessionSchema = options.sessionSchema == null ? SessionSchema : options.sessionSchema;
        this.modelName = options.modelName == null ? 'Session' : options.modelName;
        this.prefix = options.prefix == null ? 'sess:' : options.prefix;
        this.maxExpiry = options.maxExpiry == null ? 18000 : options.maxExpiry;
        if (this.client.getModel(this.modelName) === undefined) {
            this.SessionModel = this.client.model(this.modelName, this.sessionSchema, {
                scopeName: this.scopeName,
                collectionName: this.collectionName,
                maxExpiry: this.maxExpiry
            });
        }
        else {
            this.SessionModel = this.client.getModel(this.modelName);
        }
    }
    get(sid, callback) {
        (async () => {
            try {
                const key = this.prefix + sid;
                const result = await this.SessionModel.findOne({ id: key });
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
                const createSession = new this.SessionModel({ id: key, session: session });
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
                await this.SessionModel.removeById(key);
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
                const result = await this.SessionModel.findOneAndUpdate({ id: key }, { session: session });
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
                const result = await this.SessionModel.count({ id: { $like: '%' + this.prefix + '%' } });
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
                await this.SessionModel.removeMany({ id: { $like: '%' + this.prefix + '%' } });
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
                const result = await this.SessionModel.find({ id: { $like: '%' + this.prefix + '%' } });
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
