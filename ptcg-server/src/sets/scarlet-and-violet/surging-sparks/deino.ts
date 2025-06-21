import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Attack } from '../../../game/store/card/pokemon-types';

export class Deino extends PokemonCard {

  public id: number = 117;

  public tags: string[] = [];

  public stage: Stage = Stage.BASIC

  public cardTypes: CardType[] = [CardType.DARKNESS];

  public hp: number = 70;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Stomp Off',
    cost: [CardType.DARKNESS],
    damage: 0,
    text: 'Discard the top card of your opponent\'s deck.'
  }, {
    name: 'Bite',
    cost: [CardType.DARKNESS, CardType.COLORLESS],
    damage: 20,
    text: ''
  }];

  public set: string = 'SSP';

  public name: string = 'Deino';

  public fullName: string = 'Deino SSP';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Stomp Off
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;
      opponent.deck.moveTo(opponent.discard, 1);
      return state;
    }

    return state;
  }
}
