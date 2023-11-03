
const WIN_RATE = { W: 1.0, T: 0.5, L: 0.0 };

export default class Algorithm {

  name = "Elo Rating With Bonus Component";
  color = "rgb(100,200,200)";
  description = "Rating starts at 800 with additional 800 bonus component. Wins and losses reduce the bonus component.";

  constructor(id, selected) {
    this.start = 800;
    this.k = 8;

    this.id = id;
    this.selected = selected;

    this.lastmatch;
    this.rating = new Map();
    this.bonus = new Map();
  }

  rate(match) {
    if (this.lastmatch === match.match) {
      return this.rating.get(match.bot);
    }

    if (match.isFirstInSeason) {
      this.rating.clear();
      this.bonus.clear();
    }

    const botRating = this.rating.has(match.bot) ? this.rating.get(match.bot) : this.start;
    const botBonus = this.bonus.has(match.bot) ? Math.max(this.bonus.get(match.bot), 0) : this.start;

    const opponentRating = this.rating.has(match.opponent) ? this.rating.get(match.opponent) : this.start;
    const opponentBonus = this.bonus.has(match.opponent) ? Math.max(this.bonus.get(match.opponent), 0) : this.start;

    const rate = 1.0 / (1.0 + Math.pow(10.0, (opponentRating + opponentBonus - botRating - botBonus) / 400.0));
    const ratingChange = this.k * (WIN_RATE[match.outcome] - rate);
    const bonusReduction = Math.abs(ratingChange);

    if (botBonus > 0) {
      if (ratingChange > 0) {
        this.rating.set(match.bot, botRating + ratingChange + bonusReduction);
      } else {
        this.rating.set(match.bot, botRating);
      }

      this.bonus.set(match.bot, botBonus - bonusReduction);
    } else {
      this.rating.set(match.bot, botRating + ratingChange);
    }

    if (opponentBonus > 0) {
      if (ratingChange < 0) {
        this.rating.set(match.opponent, opponentRating - ratingChange + bonusReduction);
      } else {
        this.rating.set(match.opponent, opponentRating);
      }

      this.bonus.set(match.opponent, opponentBonus - bonusReduction);
    } else {
      this.rating.set(match.opponent, opponentRating - ratingChange);
    }

    this.lastmatch = match.match;

    return botRating + ratingChange;
  }

}
