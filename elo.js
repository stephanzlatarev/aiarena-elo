import bots from "./bots.json" assert { type: "json" };
import AlgorithmArena from "./algorithmArena.js";
import AlgorithmBonusPool from "./algorithmBonusPool.js";
import AlgorithmElo8 from "./algorithmElo8.js";
import AlgorithmElo8RoundReset from "./algorithmElo8RoundReset.js";
import AlgorithmEloAbsolute from "./algorithmEloAbsolute.js";
import AlgorithmEloPlacements from "./algorithmEloPlacements.js";

const START_TIME = 1664747000000;
const SEASONS = {
  12: { id: 12, name: "2022 Season 1", start: "2022-01-17T08:48:38Z" },
  13: { id: 13, name: "2022 Season 2", start: "2022-03-02T09:04:51Z" },
  16: { id: 16, name: "2022 Season 3", start: "2022-07-13T08:57:11Z" },
  18: { id: 18, name: "2022 Season 4", start: "2022-10-02T21:40:14Z" },
  20: { id: 20, name: "2023 Season 1", start: "2023-01-16T08:05:33Z" },
  21: { id: 21, name: "Pre...",        start: "2023-05-31T10:00:00Z" },
  22: { id: 22, name: "2023 Season 2", start: "2023-06-13T21:32:56Z" },
};

const algorithms = [
  new AlgorithmArena(0, true),
  new AlgorithmElo8RoundReset(2, true),
  new AlgorithmBonusPool(1, true),
  new AlgorithmElo8(3, true),
  new AlgorithmEloAbsolute(4, false),
  new AlgorithmEloPlacements(5, true),
];

let width;
let height;
let matches;
let selectedBot;

const botsMap = new Map();
for (const bot of bots) {
  botsMap.set(bot.id, bot);
}

$(document).ready(async function() {
  width = $("#chart").width();
  height = $("#chart").height() - 20;

  await load();
  calculateRatings();

  selectedBot = bots.find(bot => (bot.name === "SilverBio"));

  listAlgorithms()
  listBots();
  drawChart();

  $("#loading").remove();
});


async function load() {
  return new Promise(function(resolve) {
    $.get("/ladder.txt", function(data) {
      matches = data.split("\n").map(parseMatchLine);
      resolve();
    });
  });
}

function parseMatchLine(line) {
  const parts = line.split(":");

  return {
    match: Number(parts[0]),
    tick: Number(parts[1]) / 60 / 24,
    time: START_TIME + Number(parts[1]) * 60000,
    bot: Number(parts[2]),
    outcome: parts[3],
    opponent: Number(parts[4]),
    elo: Number(parts[5]),
  };
}

function calculateRatings() {
  const seasons = Array.from(Object.values(SEASONS)).map(season => new Date(season.start).getTime());
  for (const match of matches) {
    if (!seasons.length) break;

    while (match.time > seasons[0]) {
      match.isFirstInSeason = true;
      seasons.shift();
    }
  }

  for (const match of matches) {
    match.ratings = new Map();

    for (const algo of algorithms) {
      match.ratings.set(algo.id, algo.rate(match));
    }
  }
}

function listAlgorithms() {
  const body = $("body");
  const list = $("#algo-list");

  for (const algo of algorithms) {
    const id = "algo-" + algo.id;
    const item = $(`<li id=${id} title="${algo.description}">${algo.name}</li>`)
      .css("text-decoration", algo.selected ? "underline" : "none")
      .css("text-decoration-thickness", "4px")
      .css("text-decoration-color", algo.color);

    list.append(item);

    if (algo.id !== 0) {
      body.on("click", "#" + id, () => toggleAlgorithm(algo));
    } else {
      $("#algo-" + algo.id).css("cursor", "default");
    }
  }
}

function toggleAlgorithm(algo) {
  if (algo.id === 0) return;

  algo.selected = !algo.selected;

  $("#algo-" + algo.id)
    .css("text-decoration", algo.selected ? "underline" : "none")
    .css("text-decoration-thickness", "4px")
    .css("text-decoration-color", algo.color);
  drawChart();
}

function listBots() {
  const body = $("body");
  const list = $("#bots-list");

  for (const bot of bots) {
    const id = "bot-" + bot.id;
    list.append($(`<li id=${id}>${bot.name}</li>`));
    body.on("click", "#" + id, () => drawChart(bot));
  }
}

function drawChart(bot) {
  if (bot) {
    selectedBot = bot;
  } else {
    bot = selectedBot;
  }

  const svg = [];

  svg.push(`<svg width=${width} height=${height}>`);

  // Draw bot name
  svg.push(`<text x=${getX(100)} y=${getY(1200)} style="font-size:${getY(1000) - getY(1250)};fill:lightGray">${bot.name}</text>`);

  // Draw grid
  const fontSize = getY(1000) - getY(1050);
  for (let i = 700; i < 2600; i += 100) {
    const y = getY(i);
    svg.push(`<line x1="0" y1=${y} x2="${width}" y2="${y}" style="fill:none;stroke-width:1;stroke:lightGray" />`);
    svg.push(`<text x="10" y=${y - 2} style="font-size:${fontSize};fill:lightGray">${i}</text>`);
  }

  // Mark seasons
  for (const id in SEASONS) {
    const season = SEASONS[id];
    const x = getX((new Date(season.start).getTime() - START_TIME) / 1000 / 60 / 60 / 24);
    svg.push(`<line x1=${x} y1="0" x2=${x} y2="${height}" style="fill:none;stroke-width:1;stroke:lightGray" />`);
    svg.push(`<text x=${x + 2} y="20" style="font-size:${fontSize};fill:lightGray">${season.name}</text>`);
  }

  // Draw ratings
  for (const algo of algorithms) {
    if (!algo.selected) continue;

    const path = [];
    let previous;
    for (const match of matches) {
      if (match.bot === bot.id) {
        const rating = match.ratings.get(algo.id);
        if (!rating) continue;

        const x = getX(match.tick);
        const y = getY(rating);

        if (previous) path.push(x + "," + previous);
        path.push(x + "," + y);
        previous = y;
      }
    }
    if (path.length) {
      svg.push(`<path d="M${path.join(' L')}" style="fill:none;stroke-width:2;stroke:${algo.color}" />`);
    }
  }

  svg.push(`</svg>`);

  $("#chart").empty().append(svg.join(""));
}

function getX(tick) {
  return width * tick / 360;
}

function getY(rating) {
  return height * (1 - (rating - 600) / 2000);
}
