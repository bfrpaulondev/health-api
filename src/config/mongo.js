const mongoose = require('mongoose');

/**
 * Initializes a connection to MongoDB. The connection URI is read from
 * the environment variable `MONGO_URI` when defined, otherwise it
 * falls back to `mongodb://localhost:27017/health-api`.  While this
 * project doesn't run inside this environment, including a proper
 * connection helper demonstrates how one would set up a connection in
 * a real deployment.
 */
async function connect() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/health-api';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(`Connected to MongoDB at ${uri}`);
}

module.exports = {
  connect,
};
