// Schema initialize on mongoose
const { Schema, model } = require('mongoose');

module.exports = model('verifytoggle', new Schema({
        guildID: String,
        disabled: Boolean,
    },{
        collection: 'verifytoggle'
    })
);