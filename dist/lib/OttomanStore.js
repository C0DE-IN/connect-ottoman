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
        const ottoman = new ottoman_1.Ottoman();
        ottoman.connect(this.client);
        const SessionModel = ottoman.model('Session', SessionSchema, {
            collectionName: this.collectionName,
            maxExpiry: this.maxExpiry,
        });
        return { ottoman, SessionModel };
    }
    get(sid, callback) {
        (async () => {
            try {
                const key = this.prefix + sid;
                const { ottoman, SessionModel } = this.connectToOttoman();
                ottoman.start();
                const result = await SessionModel.findOne({ id: key });
                ottoman.close();
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
                const { ottoman, SessionModel } = this.connectToOttoman();
                ottoman.start();
                const createSession = new SessionModel({ id: key, session: session });
                await createSession.save();
                ottoman.close();
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
                const { ottoman, SessionModel } = this.connectToOttoman();
                ottoman.start();
                await SessionModel.removeById(key);
                ottoman.close();
                callback(null);
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
