
// Q9. What are the names and ages of users who are 'inactive' and have 'velit' as one of their tags?

const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);

db.collection('users').aggregate([
    {
      $match: {
        tags: "velit",
        isActive: false
      }
    },
    {
      $project: {
        name: 1,
        age: 1,
        _id: 0
      }
    }
]);

