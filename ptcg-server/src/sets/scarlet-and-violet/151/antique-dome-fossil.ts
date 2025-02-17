import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, PokemonType, TrainerType } from '../../../game/store/card/card-types';
import { Attack, GameError, GameMessage, Power, PowerType, Resistance, State, StoreLike, TrainerCard, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { RetreatEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect, DealDamageEffect } from '../../../game/store/effects/attack-effects';

export class AntiqueDomeFossil extends TrainerCard implements PokemonCard {

  public id: number = 152;

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [];

  public set: string = 'MEW';

  public name: string = 'Antique Dome Fossil';

  public fullName: string = 'Antique Dome Fossil MEW';

  public text: string =
    'Play this card as if it were a 60-HP Basic {C} Pokémon. ' +
    'This card can\'t be affected by any Special Conditions and can\'t retreat.' +
    '\n' +
    'At any time during your turn, you may discard this card from play.';

  public pokemonType: PokemonType = PokemonType.NORMAL;

  public stage: Stage = Stage.NONE;

  public evolvesFrom: string = '';

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 60;

  public weakness: Weakness[] = [];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [];

  public powers: Power[] = [{
    name: 'Domed Armor',
    powerType: PowerType.ABILITY,
    text: 'This Pokémon takes 30 less damage from attacks (after applying Weakness and Resistance).'
  }];

  public attacks: Attack[] = [];


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof DealDamageEffect && effect.target.cards.includes(this)) {
      effect.damage = Math.max(effect.damage - 30, 0);
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
