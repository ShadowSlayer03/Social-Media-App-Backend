
// Q7. What is the average number of tags per user?

const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);

db.collection('users').aggregate([
    {
          $unwind: "$tags"
    },
    {
      $group: {
        _id: "$_id",
        countOfTags: {
          $sum: 1
        }
        }
    },
    {
      $group: {
        _id: null,
        averageOfTags: {
          $avg: "$countOfTags"
        }
      }
    }
  ]);

  // OR 

  db.collection('users').aggregate([
    {
      $addFields: {
        countOfTags: {
          $size: { $ifNull: ["$tags",[]] }
        }
      }
    },
    {
      $group: {
        _id: null,
        averageNumOfTags: {
          $avg: "$countOfTags"
        }
      }
    }
  ]);

