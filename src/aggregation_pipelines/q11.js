
// Q11. Categorize users based on their favorite fruit.

const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);

db.collection('users').aggregate([
    {
      $group:{
        _id: "$favoriteFruit",
        users: { $push: "$name"}
      }
    }
]);