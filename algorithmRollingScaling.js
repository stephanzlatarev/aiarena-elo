import Elo from "./algorithmElo.js";

const TICK_THRESHOLD_LEAVE = 5;

export default class Algorithm extends Elo {

  name = "Rolling And Scaling Elo Rating";
  color = "rgb(200,200,100)";
  description = "Elo rating is not reset at the start of the season. Rating scale is adjusted when bots leave the competition.";

  constructor(id, selected) {
    super(1600, 8, false);

    this.id = id;
    this.selected = selected;

    this.appearances = new Map();
    this.pool = new Map();
    this.checkpoint = 0;
  }

  rate(match) {
    if (match.isFirstInSeason) {
      for (const [bot, rating] of this.rating) {
        this.pool.set(bot, rating);
      }
    }

    this.appearances.set(match.bot, match.tick);
    this.appearances.set(match.opponent, match.tick);

    if (!match.isFirstInSeason && (match.tick - this.checkpoint > TICK_THRESHOLD_LEAVE)) {
      for (const [bot, lastAppearance] of this.appearances) {
        if (match.tick - lastAppearance > TICK_THRESHOLD_LEAVE) {
          if (!this.rating.has(bot) || !this.pool.has(bot)) continue;

          const inflation = this.pool.get(bot) - this.rating.get(bot);
          this.pool.delete(bot);
          this.appearances.delete(bot);

          if (inflation > 0) {
            const adjustment = inflation / this.rating.size;

            for (const [one, rating] of this.rating) {
              this.rating.set(one, rating - adjustment);
            }
          }
        }
      }

      this.checkpoint = match.tick;
    }

    const rating = super.rate(match);

    if (!this.pool.has(match.bot)) this.pool.set(match.bot, this.rating.get(match.bot));
    if (!this.pool.has(match.opponent)) this.pool.set(match.opponent, this.rating.get(match.opponent));

    return rating;
  }

}
