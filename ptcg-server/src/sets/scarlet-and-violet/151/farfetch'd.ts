import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { Attack, Resistance, State, StoreLike } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Farfetchd extends PokemonCard {

  public id: number = 83;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 90;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Package Deal',
    cost: [CardType.COLORLESS],
    damage: 0,
    text: 'Draw 2 cards.'
  }, {
    name: 'Leek Clobber',
    cost: [CardType.COLORLESS],
    damage: 30,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Farfetch\'d';

  public fullName: string = 'Farfetch\'d MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Package Deal
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      player.deck.moveTo(player.hand, 2);
    }
    return state;
  }

}
