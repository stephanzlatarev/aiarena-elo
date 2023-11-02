
export default class Algorithm {

  name = "AI Arena ELO Rating";
  color = "black";
  description = "The ELO of bots as seen at https://aiarena.net";

  constructor(id, selected) {
    this.id = id;
    this.selected = selected;
  }

  rate(match) {
    return match.elo;
  }

}
