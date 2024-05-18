
// Q13. List all companies located in USA with their corresponding user count.

const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);

db.collection('users').aggregate([
    {
      $match: {
        "company.location.country": "USA"
      }
    },
    {
      $count: 'usersWithCompanyInUSA'
    }
  ]
  );