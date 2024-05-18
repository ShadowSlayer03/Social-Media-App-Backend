
// Q1. How to find the number of users that are active?

const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);
let result = await db.collection('users').aggregate([
    {
      $match: {
        isActive: true
      }
    },
    {
      $count: 'Active_Users'
    }
]);