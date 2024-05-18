
// Q10. Display name, date of register and favouriteFruit of 3 most recently registered users.

const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);

db.collection('users').aggregate([
    {
      $sort: {
        registered: -1
      }
    },
    {
      $limit: 3
    },
    {
      $project: {
        _id: 0,
        name: 1,
        favoriteFruit: 1,
        registered: 1
      }
    }
]);

