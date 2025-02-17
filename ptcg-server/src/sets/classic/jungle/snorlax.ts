import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, PowerType, StateUtils, GameMessage, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AddSpecialConditionsEffect, AfterDamageEffect } from '../../../game/store/effects/attack-effects';
import { PowerEffect } from '../../../game/store/effects/game-effects';

export class Snorlax extends PokemonCard {

  public id: number = 11;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 90;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers = [{
    name: 'Thick Skinned',
    powerType: PowerType.POKEMON_POWER,
    text:
      'Snorlax can\'t become Asleep, Confused, Paralyzed, or Poisoned. ' +
      'This power can\'t be used if Snorlax is already Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [{
    name: 'Body Slam',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: 'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
  }];

  public set: string = 'JU';

  public name: string = 'Snorlax';

  public fullName: string = 'Snorlax JU';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Thick Skinned
    if (effect instanceof AddSpecialConditionsEffect && effect.target.getPokemonCard() === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      try {
        const powerEffect = new PowerEffect(opponent, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      if (effect.specialConditions.includes(SpecialCondition.ASLEEP) ||
        effect.specialConditions.includes(SpecialCondition.CONFUSED) ||
        effect.specialConditions.includes(SpecialCondition.PARALYZED) ||
        effect.specialConditions.includes(SpecialCondition.POISONED)) {
        effect.preventDefault = true;
      }

      return state;
    }

    // Body Slam
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect.attackEffect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }
}
