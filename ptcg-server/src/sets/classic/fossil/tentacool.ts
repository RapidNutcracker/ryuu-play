import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, StateUtils, Power, PowerType, PokemonCardList, GameError } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { PowerEffect } from '../../../game/store/effects/game-effects';

export class Tentacool extends PokemonCard {

  public id: number = 56;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 30;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [];

  public powers: Power[] = [{
    name: 'Cowardice',
    powerType: PowerType.POKEMON_POWER,
    useWhenInPlay: true,
    text:
      ' At any time during your turn (before your attack), ' +
      'you may return Tentacool to your hand. ' +
      '(Discard all cards attached to Tentacool.) ' +
      'This power can\'t be used the turn you put Tentacool into play ' +
      'or if Tentacool is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [{
    name: 'Acid',
    cost: [CardType.WATER],
    damage: 10,
    text:
      'If the Defending Pokémon tries to attack during your opponent\'s next turn, ' +
      'your opponent flips a coin. If tails, that attack does nothing.'
  }];

  public set: string = 'FO';

  public name: string = 'Tentacool';

  public fullName: string = 'Tentacool FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Cowardice
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const slot = StateUtils.findCardList(state, effect.card) as PokemonCardList;

      if (slot.pokemonPlayedTurn === state.turn) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const tentacoolIsAsleepConfusedParalyzed = [
        SpecialCondition.ASLEEP,
        SpecialCondition.CONFUSED,
        SpecialCondition.PARALYZED
      ].some(sc =>
        slot.specialConditions.includes(sc));

      if (tentacoolIsAsleepConfusedParalyzed) {
        throw new GameError(GameMessage.BLOCKED_BY_SPECIAL_CONDITION);
      }

      slot.moveCardTo(effect.card, player.hand);
      slot.moveTo(player.discard);
    }

    return state;
  }
}
