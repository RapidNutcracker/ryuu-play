import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, PokemonType, TrainerType } from '../../../game/store/card/card-types';
import { Attack, GameError, GameMessage, Power, PowerType, Resistance, State, StateUtils, StoreLike, TrainerCard, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { PowerEffect, RetreatEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';

export class AntiqueOldAmber extends TrainerCard implements PokemonCard {

  public id: number = 154;

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [];

  public set: string = 'MEW';

  public name: string = 'Antique Old Amber';

  public fullName: string = 'Antique Old Amber MEW';

  public text: string =
    'Play this card as if it were a 60-HP Basic {C} Pokémon. ' +
    'This card can\'t be affected by any Special Conditions and can\'t retreat.' +
    '\n' +
    'At any time during your turn, you may discard this card from play.';

  public pokemonType: PokemonType = PokemonType.NORMAL;

  public stage: Stage = Stage.NONE;

  public evolvesFrom: string = '';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 60;

  public weakness: Weakness[] = [];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [];

  public powers: Power[] = [{
    name: 'Amber Protection',
    powerType: PowerType.ABILITY,
    text:
      'Prevent all effects of your opponent\'s Pokémon\'s Abilities done to this Pokémon.'
  }];

  public attacks: Attack[] = [];


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof PowerEffect) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const isAntiqueOldAmberInActiveSpot = opponent.active.top(1)[0] === this;
      if (isAntiqueOldAmberInActiveSpot) {
        effect.preventDefault = true;
        throw new GameError(GameMessage.BLOCKED_BY_ABILITY);
      }
    }

    if (effect instanceof RetreatEffect && effect.player.active.cards.includes(this)) {
      effect.preventDefault = true;
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    if (effect instanceof AddSpecialConditionsEffect && effect.target.cards.includes(this)) {
      effect.preventDefault = true;
    }

    return state
  }
}
