import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, Power, PowerType, Weakness, Resistance, GameError, GameMessage, StateUtils, CoinFlipPrompt, PokemonCardList } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, EvolveEffect, KnockOutEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class Muk extends PokemonCard {

  public id: number = 13;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Grimer';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.PSYCHIC }]

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Toxic Gas',
    powerType: PowerType.POKEMON_POWER,
    text:
      'Ignore all Pokémon Powers other than Toxic Gases. ' +
      'This power stops working while Muk is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [{
    name: 'Sludge',
    cost: [CardType.GRASS, CardType.GRASS, CardType.GRASS],
    damage: 30,
    text:
      'Flip a coin. If heads, the Defending Pokémon is now Poisoned.'
  }];

  public set: string = 'FO';

  public name: string = 'Muk';

  public fullName: string = 'Muk FO';

  private readonly TOXIC_GAS_MARKER = 'TOXIC_GAS_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Apply Toxic Gas while in play
    if (effect instanceof EvolveEffect && effect.pokemonCard === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      player.marker.addMarker(this.TOXIC_GAS_MARKER, this);
      opponent.marker.addMarker(this.TOXIC_GAS_MARKER, this);
    }

    // Toxic Gas
    if (effect instanceof PowerEffect && effect.player.marker.hasMarker(this.TOXIC_GAS_MARKER)) {

      const cardList = StateUtils.findCardList(state, this) as PokemonCardList;

      if ([
        SpecialCondition.ASLEEP,
        SpecialCondition.CONFUSED,
        SpecialCondition.PARALYZED
      ].some(specialCondition =>
        cardList.specialConditions.includes(specialCondition)
      )) {
        return state;
      }

      effect.preventDefault = true;
      throw new GameError(GameMessage.BLOCKED_BY_ABILITY);
    }

    // Remove Toxic Gas
    if (effect instanceof KnockOutEffect && effect.target.getPokemonCard() === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      player.marker.removeMarker(this.TOXIC_GAS_MARKER, this);
      opponent.marker.removeMarker(this.TOXIC_GAS_MARKER, this);
    }

    // Sludge
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.POISONED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }
}