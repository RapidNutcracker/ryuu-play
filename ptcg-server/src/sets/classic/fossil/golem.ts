import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Weakness } from '../../../game/store/card/pokemon-types';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { StateUtils } from '../../../game';

export class Golem extends PokemonCard {

  public id: number = 36;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Graveler';

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 80;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Avalanche',
    cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.FIGHTING, CardType.COLORLESS],
    damage: 60,
    text: ''
  }, {
    name: 'Selfdestruct',
    cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.FIGHTING, CardType.FIGHTING],
    damage: 100,
    text:
      'Does 20 damage to each Pokémon on each player\'s Bench. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.) Golem does 100 damage to itself.'
  }];

  public set: string = 'FO';

  public name: string = 'Golem';

  public fullName: string = 'Golem FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Selfdestruct
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      [...player.bench, ...opponent.bench].forEach(benchSlot => {
        if (benchSlot.cards.length > 0) {
          const putDamageEffect = new PutDamageEffect(effect, 20);
          putDamageEffect.target = benchSlot;
          store.reduceEffect(state, putDamageEffect);
        }
      });

      const selfDamageEffect = new PutDamageEffect(effect, 100);
      selfDamageEffect.target = player.active;
      store.reduceEffect(state, selfDamageEffect);
    }

    return state;
  }

}
