"use strict";

/**
 * Slingxdcc api controller - networks
 */

const _ = require("lodash"),
    SlingManager = require("../lib/SlingManager"),
    SlingChannel = require("../lib/SlingChannel"),
    thunkify = require("thunkify"),
    sling = SlingManager.instance;


module.exports.addNetwork = function* addNetwork(next) {
    if ("POST" != this.method) return yield next;

    const name = this.request.body.name,
        hostname = this.request.body.hostname,
        opts = {};

    if (!_.isUndefined(this.request.body.opts)) {
        const o = this.request.body.opts;
        if (_.isObject(o.options))
            opts.options = o.options;
        if (_.isArray(o.commands))
            opts.commands = o.commands;
        if (_.isArray(o.channels)) {
            opts.channels = [];
            for (let c of o.channels) {
                opts.channels.push(new SlingChannel(c.name, {
                    password: c.password,
                    observed: c.observed === "true",
                    regex: c.regex ? new RegExp(c.regex) : undefined,
                    groupOrder: c.groupOrder
                }));
            }
        }
    }
    try {
        this.body = sling.addNetwork(name, hostname, opts).toJSON();
    } catch (e) {
        this.body = e;
    }
};

module.exports.getNetwork = function* getNetwork(network, next) {
    if ("GET" != this.method) return yield next;

    this.body = sling.getNetwork(network);
};


module.exports.addChannel = function* addChannel(network, next) {
    if ("POST" != this.method) return yield next;

    const irc = sling.getNetwork(network).irc,
        opts = {
            password: this.request.body.password,
            observed: this.request.body.observed === "true",
            regex: this.request.body.regex ? new RegExp(this.request.body.regex) : undefined,
            groupOrder: this.request.body.groupOrder
        },
        chan = new SlingChannel(this.request.body.name, opts);


    try {
        this.body = yield thunkify(irc.addChannel.bind(irc))(chan);
    } catch (e) {
        this.body = e;
    }
};

module.exports.rmNetwork = function* rmNetwork(network, next) {
    if ("DELETE" != this.method) return yield next;

    this.body = yield thunkify(sling.removeNetwork.bind(sling))(network, this.request.body.flush);
};

module.exports.rmChannel = function* rmChannel(network, channel, next) {
    if ("DELETE" != this.method) return yield next;

    const nw = sling.getNetwork(network);

    const chans = nw.chans;

    this.body = yield thunkify(nw.removeChannel.bind(sling))(chans.get("#" + channel));

};


module.exports.getNetworks = function* getNetworks(next) {
    if ("GET" != this.method) return yield next;

    this.body = sling;
};
