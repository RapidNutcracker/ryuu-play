export class Rules {

  public firstTurnDrawCard = true;
  
  public firstTurnAttack = false;

  public firstTurnUseSupporter = false;

  public prizeCount: number = 6;

  constructor(init: Partial<Rules> = {}) {
    Object.assign(this, init);
  }

}
