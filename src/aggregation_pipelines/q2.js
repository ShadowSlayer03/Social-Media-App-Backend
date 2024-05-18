
// Q2a. How to find the average age of all users?

const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);

let result1 = await db.collection('users').aggregate([
    {
      $group: {
        _id: null,
        Average_Age_of_All_Users: {
          $avg: "$age"
        }
      }
    }
]);

  // Q2b. How to find average age of both male and female users?

let result2 = await db.collection('users').aggregate([
    {
      $group: {
        _id: "$gender",
        Average_Age_of_Each_Gender: {
          $avg: "$age"
        }
      }
    }
]);