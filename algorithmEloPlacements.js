import AbsoluteElo from "./algorithmEloAbsolute.js";

const START_RATING = 1600;
const PLACEMENT_MATCHES = 500;

export default class Algorithm extends AbsoluteElo {

  name = "Absolute Elo Rating With Placements";
  color = "rgb(100,100,200)";
  description = "First few rounds of matches for each bot don't affect ratings of other bots.";

  constructor(id, selected) {
    super(START_RATING, 8, false);

    this.id = id;
    this.selected = selected;

    this.placements = new Map();
  }

  rate(match) {
    const botPlacements = this.placements.has(match.bot) ? this.placements.get(match.bot) : PLACEMENT_MATCHES;
    const opponentPlacements = this.placements.has(match.opponent) ? this.placements.get(match.opponent) : PLACEMENT_MATCHES;

    if ((botPlacements > 0) || (opponentPlacements > 0)) {
      const botRating = this.rating.has(match.bot) ? this.rating.get(match.bot) : START_RATING;
      const opponentRating = this.rating.has(match.opponent) ? this.rating.get(match.opponent) : START_RATING;
      const rating = super.rate(match);

      if (opponentPlacements <= 0) {
        this.rating.set(match.opponent, opponentRating);
      }

      if (botPlacements > 0) {
        this.placements.set(match.bot, botPlacements - 1);

        return rating;
      } else {
        this.rating.set(match.bot, botRating);

        return botRating;
      }
    } else {
      return super.rate(match);
    }
  }

}
