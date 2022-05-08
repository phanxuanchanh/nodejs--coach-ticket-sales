const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOSTNAME}/${process.env.MONGODB_DBNAME}?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true,
        });
        console.log('+ MONGODB CONNECTION SUCCESSFULLY!');
    } catch (error) {
        console.log('+ MONGODB CONNECTION FAILURE!');
        console.log('***** reconnecting ******');
        connect();
    }
}

module.exports = { connect };