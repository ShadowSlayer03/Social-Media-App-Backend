
// Q3. List top 5 common favorite fruits among users

const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);

db.collection('users').aggregate([
    {
      $group: {
        _id: "$favoriteFruit",
        count: {
          $sum: 1
        }
      }
    },
    {
      $sort: {
        count: -1
      }
    },
    {
      $limit: 5
    }
])