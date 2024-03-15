
const express = require('express');
const app = express();

const { PrismaClient } = require('@prisma/client');

// i am too lazy to create separate file for this
const prisma = new PrismaClient()

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://discord.com");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.status(200).send();
});

app.get("*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://discord.com");
  res.header("Access-Control-Allow-Methods", "GET");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.static('static'));

app.get("/i/:id", async (req, res) => {
  const userAgent = req.headers['user-agent'];

  if (!userAgent) {
    console.log(new Date().toLocaleString(), "No user agent.", req.url);
    return res.redirect("/none.png");
  }

  const agentLower = userAgent.toLowerCase();

  if (agentLower.includes("bot") || agentLower.includes("spider") || agentLower.includes("crawler")) {
    console.log(new Date().toLocaleString(), "Bot.", req.url, userAgent);
    return res.redirect("/none.png");
  }

  if (!(agentLower.includes("macintosh") && agentLower.includes("firefox"))) {
    console.log(new Date().toLocaleString(), "Not Mac Firefox.", req.url, userAgent);
    return res.redirect("/none.png");
  }

  res.redirect("/none.png");

  const id = req.params.id.slice(0, 32);

  const j = await prisma.seenItem.upsert({
    where: {
      id,
    },
    create: {
      id,
      count: BigInt(1),
    },
    update: {
      count: {
        increment: BigInt(1),
      },
    },
  });

  console.log(new Date().toLocaleString(), "User.", req.url, j.count, userAgent);
});

app.get("/a/:id", async (req, res) => {
  const id = req.params.id.slice(0, 32);

  const j = await prisma.seenItem.findUnique({
    where: {
      id,
    }
  });

  if (!j) return res.send("0");

  res.send(j.count.toString());
});

app.listen(process.env.PORT || 8871, () => {
  console.log("Server is running on port", process.env.PORT || 8871);
});