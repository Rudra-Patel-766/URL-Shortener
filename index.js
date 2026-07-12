const express = require("express");
const path = require('path');
const cookieParser = require('cookie-parser');
const { connectToMongoDB } = require("./connect");

const URL = require("./models/url");

const urlRoute = require("./routes/url");
const staticRoute = require('./routes/staticRouter');
const userRoute = require("./routes/user");

const app = express();
const port = 8000;

connectToMongoDB("mongodb://localhost:27017/short-url")
.then(() => console.log("MongoDB Connected"));

app.set("view engine", "ejs");
app.set('views', path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/test", async(req,res) => {
    const allurls = await URL.find({});
    return res.render('home',{
        urls: allurls,
    });
});

app.use("/url", urlRoute);
app.use("/", staticRoute);
app.use("/user", userRoute);

app.get("/:shortId", async (req, res) => {
    const shortId = req.params.shortId;

    console.log("Requested shortId:", shortId);

    const entry = await URL.findOneAndUpdate(
        { shortId },
        {
            $push: {
                visitHistory: {
                    timestamp: Date.now(),
                },
            },
        }
    );

    console.log("Found entry:", entry);

    if (!entry) {
        return res.status(404).send("Short URL not found");
    }

    res.redirect(entry.redirectedURL);
});

app.listen(port, () => {console.log(`Server Started at prot: ${port}`)});