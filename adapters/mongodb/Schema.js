const { Schema, model } = require('mongoose');

const Default = new Schema({
    key: {
        type: Schema.Types.String,
        required: true
    },
    value: {
        type: Schema.Types.Mixed,
        required: true
    }
});

module.exports = (schema) => {
    return (typeof schema === 'string') ? model(schema, Default) : model('JSON', Default);
};