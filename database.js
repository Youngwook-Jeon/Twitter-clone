const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);

class Database {

    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect('mongodb+srv://meyer:1234@cluster0-pocha.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority')
            .then(() => {
                console.log('db connection successful');
            })
            .catch((err) => {
                console.error('db connection error ' + err);
        });
    }
}

module.exports = new Database();