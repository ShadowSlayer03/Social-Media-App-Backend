
// Q6. How many users have "ad" as the second tag in the list of tags?

const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);

db.collection('users').aggregate([
    {
      $match: {
        "tags.1": "ad"
      }
    },
    {
      $count: 'usersWithSecondTagAsAd'
    }
]);