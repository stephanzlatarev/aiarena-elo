
const WIN_RATE = { W: 1.0, T: 0.5, L: 0.0 };

export default class Algorithm {

  constructor(start, k, rounded) {
    this.start = start;
    this.k = k;
    this.rounded = rounded;

    this.rating = new Map();
  }

  rate(match) {
    if (this.rating.get("match") === match.match) return this.rating.get(match.bot);

    let botRating = this.rating.has(match.bot) ? this.rating.get(match.bot) : this.start;
    let opponentRating = this.rating.has(match.opponent) ? this.rating.get(match.opponent) : this.start;

    const rate = 1.0 / (1.0 + Math.pow(10.0, (opponentRating - botRating) / 400.0));
    let change = this.k * (WIN_RATE[match.outcome] - rate);

    if (this.rounded) {
      change = Math.round(change);
    }

    botRating += change;
    opponentRating -= change;

    this.rating.set(match.bot, botRating);
    this.rating.set(match.opponent, opponentRating);
    this.rating.set("match", match.match);

    return botRating;
  }

}
