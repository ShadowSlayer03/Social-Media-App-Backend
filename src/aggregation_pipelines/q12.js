
// Q12. Find users that have "enim" and "id" as their tags.

const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);

db.collection('users').aggregate([
    {
      $match: {
        $and: [
          { tags: "enim" },
          { tags: "id" }
        ]
      }
    }
]);