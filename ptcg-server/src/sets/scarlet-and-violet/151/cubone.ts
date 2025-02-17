import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { CoinFlipPrompt, GameMessage, PokemonCardList, Power, PowerType, State, StateUtils, StoreLike } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { DealDamageEffect } from '../../../game/store/effects/attack-effects';

export class Cubone extends PokemonCard {

  public id: number = 104;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 70;

  public weakness = [{ type: CardType.GRASS }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Cheering Bone',
    powerType: PowerType.ABILITY,
    text:
      'As long as this Pokémon is on your Bench, ' +
      'attacks used by your Marowak do 30 more damage to your opponent\'s Active Pokémon ' +
      '(before applying Weakness and Resistance).'
  }];

  public attacks = [{
    name: 'Hit Twice',
    cost: [CardType.FIGHTING],
    damage: 0,
    text: 'Flip 2 coins. This attack does 10 damage for each heads.'
  }];

  public set: string = 'MEW';

  public name: string = 'Cubone';

  public fullName: string = 'Cubone MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Cheering Bone
    if (effect instanceof DealDamageEffect) {
      const player = effect.player;
      const cardList = StateUtils.findCardList(state, this);

      // check if Cubone is on player's Bench
      const benchIndex = player.bench.indexOf(cardList as PokemonCardList);
      if (benchIndex === -1) {
        return state;
      }

      // Is Marowak attacking?
      const isDamageFromMarowak = effect.source === player.active && player.active.getPokemonCard()?.name === 'Marowak';

      if (isDamageFromMarowak) {
        // Try to reduce PowerEffect, to check if something is blocking our ability
        try {
          const powerEffect = new PowerEffect(player, this.powers[0], this);
          store.reduceEffect(state, powerEffect);
        } catch {
          return state;
        }

        effect.damage += 30;
      }

      return state;
    }

    // Hit Twice
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

    return state;
  }
}
