
// Q5. Which country related to a particular company has the highest number of registered users?

const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);

db.collection('users').aggregate([
	{
	  $group: {
	    _id: "$company.location.country",
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
    $limit: 1
  }
]);