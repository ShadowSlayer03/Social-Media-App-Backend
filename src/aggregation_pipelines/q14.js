
// Lookups
const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);

db.collection('users').aggregate([
    {
      $lookup: {
        from: "authors",
        localField: "author_id",
        foreignField: "_id",
        as: "author_details"
      }
    },
    {
      $addFields: {
        author_details: {
          $arrayElemAt: ["$author_details", 0]
        }
      }
    }
]); 