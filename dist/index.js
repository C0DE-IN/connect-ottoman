"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionSchema = void 0;
const express_session_1 = require("express-session");
const ottoman_1 = require("ottoman");
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
        this.client = options.client;
        this.scopeName = options.scopeName ?? '_default';
        this.collectionName = options.collectionName ?? '_default';
        this.sessionSchema = options.sessionSchema;
        this.modelName = options.modelName ?? 'Session';
        this.prefix = options.prefix ?? 'sess:';
        this.maxExpiry = options.maxExpiry ?? 86400000;
        this.SessionModel = this.client.getModel(this.modelName) ||
            this.client.model(this.modelName, this.sessionSchema || exports.SessionSchema, {
                scopeName: this.scopeName,
                collectionName: this.collectionName,
                maxExpiry: this.maxExpiry
            });
    }
    async get(sid, callback) {
        const key = this.prefix + sid;
        try {
            const sess = await this.SessionModel.findById(key);
            console.log('get try', key);
            callback(null, sess.session);
        }
        catch (err) {
            console.log('get catch', key);
            callback(err);
        }
    }
    async set(sid, session, callback) {
        const key = this.prefix + sid;
        try {
            await this.SessionModel.create({ id: key, session: session });
            console.log('set try', key);
            callback?.();
        }
        catch (err) {
            console.log('set catch', key);
            callback?.(err);
        }
    }
    async destroy(sid, callback) {
        const key = this.prefix + sid;
        try {
            await this.SessionModel.removeById(key);
            console.log('destroy try', key);
            callback?.();
        }
        catch (err) {
            console.log('destroy catch', key);
            callback?.(err);
        }
    }
    async touch(sid, session, callback) {
        const key = this.prefix + sid;
        try {
            await this.SessionModel.updateById(key, { session: session }, { new: true, upsert: true });
            console.log('touch try', key);
            callback?.();
        }
        catch (err) {
            console.log('touch catch');
            callback?.();
        }
    }
    async clear(callback) {
        try {
            await this.SessionModel.removeMany({ name: { $like: '%*%' } });
            console.log('clear try');
            callback?.();
        }
        catch (err) {
            console.log('clear catch');
            callback?.(err);
        }
    }
}
exports.SessionSchema = new ottoman_1.Schema({
    id: { type: String, required: true },
    session: { type: ottoman_1.Schema.Types.Mixed, required: true },
});
exports.default = OttomanStore;
