import Elo from "./algorithmElo.js";

const ANCHOR = {
  318: 1300, // SilverBio
   99: 1500, // RustyTanks
  100: 1800, // SharpShadows
  517: 2000, // VeTerran-revived
};

export default class Algorithm extends Elo {

  name = "Absolute Elo Rating";
  color = "rgb(200,100,200)";
  description = "Elo ratings of SilverBio, RustyTanks, SharpShadows and VeTerran-revived are fixed at 1330, 1500, 1800 and 2000.";

  constructor(id, selected) {
    super(1600, 8, false);

    this.id = id;
    this.selected = selected;
  }

  rate(match) {
    const anchor = ANCHOR[match.bot];
    let rating = super.rate(match);

    if (anchor) {
      rating = anchor;
      this.rating.set(match.bot, anchor);
    }

    return rating;
  }

}
