import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, PokemonType, TrainerType } from '../../game/store/card/card-types';
import { Attack, Power, Resistance, State, StoreLike, TrainerCard, Weakness } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { KnockOutEffect } from '../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../game/store/effects/attack-effects';

export class ClefairyDoll extends TrainerCard implements PokemonCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [];

  public set: string = 'BS';

  public name: string = 'Clefairy Doll';

  public fullName: string = 'Clefairy Doll BS';

  public text: string =
    'Play Clefairy Doll as if it were a Basic Pokémon. ' +
    'While in play, Clefairy Doll counts as a Pokémon (instead of a Trainer card). ' +
    'Clefairy Doll has no attacks, can\'t retreat, and can\'t be Asleep, Confused, Paralyzed, or Poisoned. ' +
    'If Clefairy Doll is Knocked Out, it doesn\'t count as a Knocked Out Pokémon. ' +
    'At any time during your turn before your attack, you may discard Clefairy Doll.';

  public stage: Stage = Stage.NONE;

  public cardType: CardType = CardType.NONE;

  public hp: number = 10;

  public weakness: Weakness[] = [];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [];

  public attacks: Attack[] = [];

  public powers: Power[] = [];

  public pokemonType: PokemonType = PokemonType.NORMAL;

  public evolvesFrom: string = '';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof KnockOutEffect && effect.target.cards.includes(this)) {
      effect.prizeCount = 0;
    }

    if (effect instanceof AddSpecialConditionsEffect && effect.target.cards.includes(this)) {
      effect.preventDefault = true;
    }

    return state
  }
}
