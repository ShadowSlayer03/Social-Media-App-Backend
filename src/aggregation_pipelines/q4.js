
// Q4. Find the total number of males and females

const client = new MongoClient(uri);
await client.connect();
let db = client.db(`aggregation`);

db.collection('users').aggregate([
    {
        $group: {
        _id: "$gender",
        number: {
            $sum: 1
        }
        }
    }
]);