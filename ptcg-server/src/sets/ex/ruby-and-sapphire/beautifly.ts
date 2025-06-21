import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Power,
  PowerType,
  PlayerType,
  CoinFlipPrompt
} from '../../../game';
import { AddSpecialConditionsEffect, AfterDamageEffect, ApplyWeaknessEffect, HealTargetEffect } from '../../../game/store/effects/attack-effects';

export class Beautifly extends PokemonCard {

  public id: number = 2;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Silcoon';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 80;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [];

  public powers: Power[] = [{
    name: 'Withering Dust',
    powerType: PowerType.POKEBODY,
    text:
      'As long as Beautifly is in play, do not apply Resistance for all Active Pokémon.',
  }];

  public attacks = [{
    name: 'Stun Spore',
    cost: [CardType.GRASS],
    damage: 20,
    text:
      'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
  }, {
    name: 'Parallel Gain',
    cost: [CardType.GRASS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 50,
    text:
      'Remove 1 damage counter from each of your Pokémon, including Beautifly.'
  }
  ];

  public set: string = 'RS';

  public name: string = 'Beautifly';

  public fullName: string = '#2 Beautifly RS';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Withering Dust
    if (effect instanceof ApplyWeaknessEffect) {
      const player = effect.player;

      let beautiflyInPlay = false;
      player.forEachPokemon(PlayerType.ANY, (cardList) => {
        if (cardList.getPokemonCard() === this) {
          beautiflyInPlay = true;
        }
      });

      if (beautiflyInPlay) {
        effect.ignoreResistance = true;
      }
    }

    // Stun Spore
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    // Parallel Gain
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        const healTargetEffect = new HealTargetEffect(effect.attackEffect, 10);
        healTargetEffect.target = cardList;
        store.reduceEffect(state, healTargetEffect);
      });
    }

    return state;
  }
}
