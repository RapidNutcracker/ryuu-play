import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Power, PowerType, Weakness, Resistance, GameError, GameMessage, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';

export class Dragonite extends PokemonCard {

  public id: number = 4;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Dragonair';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 100;

  public weakness: Weakness[] = []

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Step In',
    powerType: PowerType.POKEMON_POWER,
    useWhenInPlay: true,
    text:
      'Once during your turn (before your attack), ' +
      'if Dragonite is on your Bench, you may switch it with your Active Pokémon.'
  }];

  public attacks = [{
    name: 'Slam',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 40,
    text: 'Flip 2 coins. This attack does 40 damage times the number of heads.'
  }];

  public set: string = 'FO';

  public name: string = 'Dragonite';

  public fullName: string = 'Dragonite FO';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Step In
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      const benchIndex = player.bench.findIndex(benchSlot => benchSlot.getPokemonCard() === this);
      if (benchIndex === -1) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      player.switchPokemon(player.active);

      return state;
    }

    // Slam
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 40 * heads;
      });
    }

    return state;
  }
}