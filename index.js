const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv-flow").config();

require("./routes/middlewares/mongo");

const app = express();
const port = process.env.PORT || 3080;

// Open AI Configuration
const configuration = new Configuration({
  organization: process.env.ORGANIZATION,
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  if (req.originalUrl === "/api/stripe/webhook") {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true }));
//form-urlencoded
app.set("jwt", "ebeb1a5ada5cf38bfc2b49ed5b3100e0");

app.use("/api", require("./routes/api"));

// Primary Open AI Route-------
app.post("/", async (req, res) => {
  console.log("main api..");
  let { message, currentModel, temperature } = req.body;
  currentModel = "text-davinci-003";
  try {
    const response = await openai.createCompletion({
      model: `${currentModel}`, // "text-davinci-003",
      prompt: `${message}`,
      max_tokens: 100,
      temperature,
    });
    res.json({
      message: response.data.choices[0].text,
    });
  } catch (error) {
    console.log(error);
    res.json({
      error: "Something went wrong!!",
    });
  }
});

// Get Models Route
app.get("/models", async (req, res) => {
  const response = await openai.listEngines();
  res.json({
    models: response.data,
  });
});
// ----------------
// Default Index Page
app.use(express.static(__dirname + "/build"));
// Send all other items to index file
app.get("*", (req, res) => res.sendFile(__dirname + "/build/index.html"));

app.listen(port, () => {
  console.log(`Example app listening at ${process.env.DOMAIN}:${port}`);
});
