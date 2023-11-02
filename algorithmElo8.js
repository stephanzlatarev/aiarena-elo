import Elo from "./algorithmElo.js";

export default class Algorithm extends Elo {

  name = "Rolling Elo Rating";
  color = "rgb(100,200,100)";
  description = "Elo rating is not reset at the start of the season.";

  constructor(id, selected) {
    super(1600, 8, false);

    this.id = id;
    this.selected = selected;
  }

}
