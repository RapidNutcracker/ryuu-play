import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, GameMessage } from '../../../game';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class Zapdos extends PokemonCard {

  public id: number = 15;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 80;

  public weakness = [];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Thunderstorm',
    cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.LIGHTNING, CardType.LIGHTNING],
    damage: 40,
    text:
      'For each of your opponent\'s Benched Pokémon, flip a coin. ' +
      'If heads, this attack does 20 damage to that Pokémon. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.) ' +
      'Then, Zapdos does 10 damage times the number of tails to itself.'
  }];

  public set: string = 'FO';

  public name: string = 'Zapdos';

  public fullName: string = 'Zapdos FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Thunderstorm
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = effect.opponent;

      const opponentBenchPokemon = opponent.bench.filter(benchSlot => benchSlot.cards.length > 0);

      let numberOfTails: number = 0;
      return store.prompt(state,
        new Array(opponentBenchPokemon.length).fill(new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)),
        results => {
          opponentBenchPokemon.forEach((benchSlot, index) => {
            if (results[index] === true) {
              const damageEffect = new PutDamageEffect(effect, 20);
              damageEffect.target = benchSlot;
              store.reduceEffect(state, damageEffect);
            } else {
              numberOfTails++;
            }
          });

          const damageEffect = new PutDamageEffect(effect, 10 * numberOfTails);
          damageEffect.target = player.active;
          store.reduceEffect(state, damageEffect);
        });
    }

    return state;
  }

}
