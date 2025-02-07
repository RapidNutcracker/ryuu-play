import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';

export class Jynx extends PokemonCard {

  public id: number = 31;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 70;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Doubleslap',
      cost: [CardType.PSYCHIC],
      damage: 10,
      text: 'Flip 2 coins. This attack does 10 damage times the number of heads.'
    },
    {
      name: 'Meditate',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS],
      damage: 20,
      text: 'Does 20 damage plus 10 more damage for each damage counter on the Defending Pokémon.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Jynx';

  public fullName: string = 'Jynx BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Doubleslap
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 10 * heads;
      });
    }

    // Meditate
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      effect.damage += effect.opponent.active.damage;
    }

    return state;
  }
}
