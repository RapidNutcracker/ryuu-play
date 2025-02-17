import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Power, PowerType, GameLog, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { PowerEffect } from '../../../game/store/effects/game-effects';
import {
  AbstractAttackEffect,
  AddMarkerEffect,
  AddSpecialConditionsEffect,
  DiscardCardsEffect,
  HealTargetEffect,
  PutCountersEffect,
  RemoveSpecialConditionsEffect
} from '../../../game/store/effects/attack-effects';

export class Charmeleon extends PokemonCard {

  public id: number = 8;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Charmander';

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 90;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Flare Veil',
    powerType: PowerType.ABILITY,
    text:
      'Prevent all effects of attacks used by your opponent\'s Pokémon ' +
      'done to this Pokémon. (Damage is not an effect.)'
  }];

  public attacks = [{
    name: 'Combustion',
    cost: [CardType.FIRE, CardType.FIRE],
    damage: 50,
    text: ''
  }];

  public set: string = 'PAF';

  public name: string = 'Charmeleon';

  public fullName: string = 'Charmeleon PAF';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Flare Veil
    if (effect instanceof AbstractAttackEffect && effect.target.getPokemonCard() === this) {
      if ([
        PutCountersEffect,
        DiscardCardsEffect,
        AddSpecialConditionsEffect,
        RemoveSpecialConditionsEffect,
        HealTargetEffect,
        AddMarkerEffect
      ].some(e => effect instanceof e)) {
        // Try to reduce PowerEffect, to check if something is blocking our ability
        try {
          const player = StateUtils.findOwner(state, effect.target);
          const powerEffect = new PowerEffect(player, this.powers[0], this);
          store.reduceEffect(state, powerEffect);
        } catch {
          return state;
        }

        effect.preventDefault = true;
        store.log(state, GameLog.LOG_TEXT, { text: 'Flame Veil blocked the effect!' });
      }
    }

    return state;
  }
}
