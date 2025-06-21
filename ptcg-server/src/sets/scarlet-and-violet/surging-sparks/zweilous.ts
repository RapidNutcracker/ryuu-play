import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Attack } from '../../../game/store/card/pokemon-types';

export class Zweilous extends PokemonCard {

  public id: number = 118;

  public tags: string[] = [];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Deino';

  public cardTypes: CardType[] = [CardType.DARKNESS];

  public hp: number = 100;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Stomp Off',
    cost: [CardType.DARKNESS],
    damage: 0,
    text: 'Discard the top 2 cards of your opponent\'s deck.'
  }, {
    name: 'Darkness Fang',
    cost: [CardType.DARKNESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 60,
    text: ''
  }];

  public set: string = 'SSP';

  public name: string = 'Zweilous';

  public fullName: string = 'Zweilous SSP';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Stomp Off
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;
      opponent.deck.moveTo(opponent.discard, 2);
      return state;
    }

    return state;
  }
}
