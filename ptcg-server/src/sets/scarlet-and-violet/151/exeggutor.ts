import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';

export class Exeggutor extends PokemonCard {

  public id: number = 103;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Exeggcute';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 140;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Psychic',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: 'This attack does 30 more damage for each Energy attached to your opponent\'s Active Pokémon.'
  }, {
    name: 'Hammer In',
    cost: [CardType.GRASS, CardType.GRASS, CardType.COLORLESS],
    damage: 130,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Exeggutor';

  public fullName: string = 'Exeggutor MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Psychic
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(opponent);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      const energyCount = checkProvidedEnergyEffect.energyMap.reduce((left, p) => left + p.provides.length, 0);
      effect.damage += energyCount * 30;
    }

    return state;
  }

}
