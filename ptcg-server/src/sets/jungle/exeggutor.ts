import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, ChoosePokemonPrompt, GameMessage, PlayerType, SlotType, CoinFlipPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { AfterDamageEffect } from '../../game/store/effects/attack-effects';

export class Exeggutor extends PokemonCard {

  public id: number = 35;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Exeggcute';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 80;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Teleport',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: 'Switch Exeggutor with 1 of your Benched Pokémon.'
  }, {
    name: 'Big Eggsplosion',
    cost: [CardType.GRASS, CardType.GRASS, CardType.COLORLESS],
    damage: 20,
    text:
      'Flip a number of coins equal to the number of Energy attached to Exeggutor. ' +
      'This attack does 20 damage times the number of heads.'
  }];

  public set: string = 'JU';

  public name: string = 'Exeggutor';

  public fullName: string = 'Exeggutor JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Teleport
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const hasBenched = player.bench.some(b => b.cards.length > 0);
      if (!hasBenched) {
        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_NEW_ACTIVE_POKEMON,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false },
      ), selected => {
        if (!selected || selected.length === 0) {
          return state;
        }
        const target = selected[0];
        player.switchPokemon(target);
      });
    }

    // Big Eggsplosion
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player, player.active);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      const energyCount = checkProvidedEnergyEffect.energyMap.reduce((left, p) => left + p.provides.length, 0);
      effect.damage += energyCount * 30;

      return store.prompt(state,
        new Array(energyCount).fill(new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)),
        results => {
          let heads: number = 0;
          results.forEach(r => { heads += r ? 1 : 0; });
          effect.damage = 20 * heads;
        });
    }

    return state;
  }

}
