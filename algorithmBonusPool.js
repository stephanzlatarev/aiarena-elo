import Elo from "./algorithmElo.js";

export default class Algorithm extends Elo {

  name = "Elo Rating With Bonus Pool";
  color = "rgb(200,100,100)";
  description = "Resets rating to 800 and bonus pool to 800 at start of the season. Wins are rewarded with matching bonus points. Loss reduce the bonus pool.";

  constructor(id, selected) {
    super(800, 8, true);

    this.id = id;
    this.selected = selected;

    this.bonus = new Map();
  }

  rate(match) {
    if (match.isFirstInSeason) {
      this.rating.clear();
      this.bonus.clear();
    }

    const bonusPool = this.bonus.has(match.bot) ? this.bonus.get(match.bot) : 800;
    const previousRating = this.rating.has(match.bot) ? this.rating.get(match.bot) : 800;

    let rating = super.rate(match);

    if ((bonusPool > 0) && (rating !== previousRating)) {
      const change = Math.abs(rating - previousRating);

      if (rating > previousRating) {
        rating += change;
      } else {
        rating = previousRating;
      }

      this.rating.set(match.bot, rating);
      this.bonus.set(match.bot, bonusPool - change);
    }

    return rating;
  }

}
