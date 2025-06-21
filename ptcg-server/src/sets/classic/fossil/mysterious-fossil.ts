import { Stage, CardType, TrainerType, PokemonType } from '../../../game/store/card/card-types';
import { Attack, GameError, GameMessage, PokemonCard, Power, Resistance, State, StoreLike, TrainerCard, Weakness } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { KnockOutEffect, RetreatEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';
import { PlayPokemonEffect } from '../../../game/store/effects/play-card-effects';

export class MysteriousFossil extends TrainerCard implements PokemonCard {

  public id: number = 62;

  public trainerType: TrainerType = TrainerType.FOSSIL;

  public tags = [];

  public set: string = 'FO';

  public name: string = 'Mysterious Fossil';

  public fullName: string = 'Mysterious Fossil FO';

  public text: string =
    'Play Mysterious Fossil as if it were a Basic Pokémon. ' +
    'While in play, Mysterious Fossil counts as a Pokémon (instead of a Trainer card). ' +
    'Mysterious Fossil has no attacks, can\'t retreat, and can\'t be Asleep, Confused, Paralyzed, or Poisoned. ' +
    'If Mysterious Fossil is Knocked Out, it doesn\'t count as a Knocked Out Pokémon. (Discard it anyway.) ' +
    'At any time during your turn before your attack, you may discard Mysterious Fossil from play.';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 10;

  public pokemonType: PokemonType = PokemonType.NORMAL;

  public evolvesFrom: string = '';
  
  public stage: Stage = Stage.BASIC;

  public weakness: Weakness[] = [];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [];

  public powers: Power[] = [];

  public attacks: Attack[] = [];


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      this.stage = Stage.BASIC;
    }

    if (effect instanceof RetreatEffect && effect.player.active.getPokemonCard() === this) {
      effect.preventDefault = true;
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    if (effect instanceof AddSpecialConditionsEffect && effect.target.getPokemonCard() === this) {
      effect.preventDefault = true;
    }

    if (effect instanceof KnockOutEffect && effect.target.getPokemonCard() === this) {
      effect.prizeCount = 0;
    }

    return state
  }
}