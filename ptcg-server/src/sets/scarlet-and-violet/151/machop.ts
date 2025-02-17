import { Attack } from '../../../game/store/card/pokemon-types';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';

export class Machop extends PokemonCard {

  public id: number = 66;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 70;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Mountain Mashing',
    cost: [CardType.FIGHTING],
    damage: 0,
    text: 'Discard the top card of your opponent\'s deck.'
  }, {
    name: 'Punch',
    cost: [CardType.FIGHTING, CardType.FIGHTING],
    damage: 30,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Machop';

  public fullName: string = 'Machop MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const opponent = effect.opponent;
      opponent.deck.moveTo(opponent.discard, 1);
      return state;
    }

    return state;
  }
}
