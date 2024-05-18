
// Q8. How many users have 'enim' as one of their tags?

const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);

db.collection('users').aggregate([
    {
    $match: {
      "tags": "enim"
      }
    },
   {
     $count: 'documentsContainingEnimTags'
   }
  ]);

