import mongoose from "mongoose";
import dns from "node:dns";

const fallbackDnsServers = ["8.8.8.8", "1.1.1.1"];
let connectionPromise;

function redactMongoUri(value = "") {
  return value.replace(
    /(mongodb(?:\+srv)?:\/\/[^:\s/]+:)([^@\s/]+)(@)/g,
    "$1<password>$3"
  );
}

export default async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Set it to your MongoDB Atlas connection string.");
  }

  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  connectionPromise = connect(mongoUri);

  try {
    return await connectionPromise;
  } catch (error) {
    connectionPromise = undefined;
    throw error;
  }
}

async function connect(mongoUri) {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    const shouldRetryWithPublicDns =
      mongoUri.startsWith("mongodb+srv://") &&
      error.message.includes("querySrv ECONNREFUSED");

    if (!shouldRetryWithPublicDns) {
      throw new Error(`MongoDB connection failed: ${redactMongoUri(error.message)}`);
    }

    console.warn("MongoDB Atlas DNS lookup failed. Retrying with public DNS resolvers.");
    dns.setServers(fallbackDnsServers);

    try {
      await mongoose.connect(mongoUri);
      console.log("MongoDB connected successfully");
      return mongoose.connection;
    } catch (retryError) {
      throw new Error(`MongoDB connection failed: ${redactMongoUri(retryError.message)}`);
    }
  }
}
