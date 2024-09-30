const EventEmitter = require('events').EventEmitter;
const mongoose = require('mongoose');

class Base extends EventEmitter {
    constructor(mongoURL, connectionOptions = {}) {
        super();

        if (!mongoURL || !mongoURL.startsWith('mongodb')) throw new TypeError('No mongodb url was provided!');
        if (typeof mongoURL !== 'string') throw new TypeError(`Expected a string for mongodbURL, received ${typeof mongoURL}`);
        if (typeof connectionOptions !== 'object') throw new TypeError(`Expected Object for connectionOptions, received ${typeof connectionOptions}`);

        this.mongoURI = mongoURL;
        this.options = connectionOptions;
        this.connection = this._create();

        mongoose.connection.on('error', (e) => {
            this.emit('error', e);
        });

        mongoose.connection.on('open', () => {
            this.readyMongo = new Date();

            console.log('[MZRDB] Connected MongoDB');
        });
    }


    _create() {
        return mongoose.connect(this.mongoURI);
    }

    _destroyDatabase() {
        mongoose.disconnect();
        this.readyMongo = undefined;

        return true;
    }

    get _state() {
        if (!this.connection || typeof this.connection.readyState !== 'number') return 'Disconnected';

        switch (this.connection.readyState) {
            case 0: return 'Disconnected';
            case 1: return 'Connected with mzrdb';
            case 2: return 'Connecting';
            case 3: return 'Disconnecting';
        };
    }
}

module.exports = Base;