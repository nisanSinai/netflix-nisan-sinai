import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;
console.log("Mongo URI:", uri);
// something like, see .env.example
// const uri = "mongodb+srv://asaf:asaf@clusterxx.2xzmmut.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let client;
let db;

async function getDb() {
  if (!client || !client.topology?.isConnected()) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db("sample_mflix"); // change to your DB name
    console.log("✅ Connected to MongoDB");
  }
  return db;
}


function buildFilter(search) {
  if (!search) return {};
  // Default: regex search on title
  return { title: { $regex: search, $options: "i" } };
}


async function getMovies(page = 1, limit = 10, search = "") {
  const database = await getDb();
  const movies = database.collection("movies");

  const filter = buildFilter(search);
  
  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    movies.find(filter)
    .sort({ year: -1 })
    .skip(skip)
    .limit(limit)
    .toArray(),
    movies.countDocuments(filter)
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: results
  };
}

export { getMovies };
