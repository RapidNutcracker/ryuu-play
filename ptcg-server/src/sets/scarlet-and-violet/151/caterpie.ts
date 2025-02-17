import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Caterpie extends PokemonCard {

  public id: number = 10;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 50;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Leaf Munch',
      cost: [CardType.GRASS],
      damage: 10,
      text: 'If your opponent\'s Active Pokémon is a {G} Pokémon, this attack does 30 more damage.'
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Caterpie';

  public fullName: string = 'Caterpie MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Leaf Munch
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const defending = opponent.active.getPokemonCard();
      if (defending && defending.cardType == CardType.GRASS) {
        effect.damage += 30;
      }
    }

    return state;
  }

}
