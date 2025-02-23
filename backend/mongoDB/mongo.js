const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

mongoose.connect('mongodb+srv://srkeene5:alex1@boilermake.8vpy0.mongodb.net/', {// add to .env ty
    dbName: 'AnalyzedFiles',
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => err ? console.log(err) : console.log('Connected to yourDB-name database'));

app.post("/postDirAnalysis", async (req, resp) => {
    try {
        const fileStrings = new FileString(req.body);
        let result = await fileStrings.save();
        result = result.toObject();
        if (result) {
            delete result.password;
            resp.send(req.body);
            console.log(result);
        } else {
            console.log("User already register");
        }

    } catch (e) {
        resp.send("Something Went Wrong");
    }
});
app.listen(5000);
