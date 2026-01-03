const { MongoClient, ServerApiVersion } = require("mongodb");

let client = null;
let db = null;

const connectToDatabase = async () => {
  if (db) return db;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI not set. Proceeding without database connection.");
    return null;
  }

  try {
    console.log("[DB] Attempting to connect to MongoDB...");
    
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      serverSelectionTimeoutMS: 30000,  // Increased from 5000
      connectTimeoutMS: 30000,           // Increased from 5000
      socketTimeoutMS: 45000,            // Increased from 10000
    });

    await client.connect();
    console.log("[DB] Client connected successfully");
    
    const dbName = process.env.MONGODB_DB || "career_counselling";
    db = client.db(dbName);
    
    // Test the connection
    await db.command({ ping: 1 });
    console.log("[DB] ✓ Pinged your deployment. Connected to MongoDB:", dbName);
    
    // Ensure collections exist
    await ensureCollections(db);
    console.log("[DB] ✓ Collections initialized");
    
    return db;
  } catch (err) {
    console.error("[DB] ✗ connectToDatabase failed:");
    console.error("  Error name:", err.name);
    console.error("  Error message:", err.message);
    
    // Log specific error details
    if (err.message.includes("ENOTFOUND")) {
      console.error("  → Cannot resolve MongoDB host. Check your connection string.");
    } else if (err.message.includes("Authentication failed")) {
      console.error("  → Invalid credentials. Check username/password in MONGODB_URI.");
    } else if (err.message.includes("connect ETIMEDOUT")) {
      console.error("  → Connection timeout. Check network/firewall or MongoDB Atlas IP whitelist.");
    }
    
    // Clean up
    try {
      if (client) await client.close();
    } catch (closeErr) {
      console.error("[DB] Error closing client:", closeErr.message);
    }
    
    client = null;
    db = null;
    return null; // fail-soft: allow app to continue with in-memory store
  }
};

const getDb = () => db;
const getClient = () => client;

// Ensure required collections exist with basic validation and indexes
const ensureCollections = async (database) => {
  try {
    const existing = await database.listCollections().toArray();
    const names = existing.map((c) => c.name);

    // users collection
    if (!names.includes("users")) {
      await database.createCollection("users", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "class_status", "phone", "verified", "createdAt"],
            properties: {
              _id: { bsonType: ["string", "objectId"], description: "user id" },
              name: { bsonType: "string" },
              email: { bsonType: "string" },
              class_status: { bsonType: "string" },
              phone: { bsonType: "string" },
              verified: { bsonType: "bool" },
              createdAt: { bsonType: ["date", "string"] },
              profile: { bsonType: ["object", "null"] },
            },
          },
        },
      });
      console.log("[DB] Created collection: users");
    }
    
    // Indexes for users
    await database.collection("users").createIndexes([
      { key: { _id: 1 }, name: "_id_" },
      { key: { email: 1 }, name: "email_1", unique: false },
      { key: { phone: 1 }, name: "phone_1", unique: false },
    ]);

    // testResponses collection
    if (!names.includes("testResponses")) {
      await database.createCollection("testResponses", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "answers", "submittedAt", "careerSuggestion"],
            properties: {
              _id: { bsonType: ["string", "objectId"] },
              userId: { bsonType: "string" },
              answers: { bsonType: "array" },
              submittedAt: { bsonType: ["date", "string"] },
              careerSuggestion: { bsonType: "object" },
            },
          },
        },
      });
      console.log("[DB] Created collection: testResponses");
    }
    
    // Indexes for testResponses
    await database.collection("testResponses").createIndexes([
      { key: { _id: 1 }, name: "_id_" },
      { key: { userId: 1 }, name: "userId_1", unique: true },
      { key: { submittedAt: -1 }, name: "submittedAt_-1" },
    ]);
  } catch (err) {
    console.error("[DB] Error ensuring collections:", err.message);
    throw err;
  }
};

// Graceful shutdown
const closeDatabase = async () => {
  if (client) {
    try {
      await client.close();
      console.log("[DB] Connection closed");
      client = null;
      db = null;
    } catch (err) {
      console.error("[DB] Error closing connection:", err.message);
    }
  }
};

module.exports = {
  connectToDatabase,
  getDb,
  getClient,
  closeDatabase,
};