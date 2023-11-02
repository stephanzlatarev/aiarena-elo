import Elo from "./algorithmElo.js";

export default class Algorithm extends Elo {

  name = "Elo Rating (K-Factor=8, Rounding)";
  color = "gray";
  description = "Same algorithm as used by AI Arena. Showing that the calculations here are OK.";

  constructor(id, selected) {
    super(1600, 8, true);

    this.id = id;
    this.selected = selected;
  }

  rate(match) {
    if (match.isFirstInSeason) {
      this.rating.clear();
    }

    return super.rate(match);
  }

}
