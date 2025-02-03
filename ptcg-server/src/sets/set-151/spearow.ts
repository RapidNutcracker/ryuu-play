import { CheckPokemonPlayedTurnEffect } from '../../game/store/effects/check-effects';
import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Power, PowerType, Resistance, State, StoreLike, Weakness } from '../../game';
import { Stage, CardType } from '../../game/store/card/card-types';

export class Spearow extends PokemonCard {

  public id: number = 21;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 50;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Evolutionary Advantage',
    powerType: PowerType.ABILITY,
    text: 'If you go second, this Pokémon can evolve during your first turn.'
  }];

  public attacks = [{
    name: 'Speed Dive',
    cost: [CardType.COLORLESS,],
    damage: 10,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Spearow';

  public fullName: string = 'Spearow MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Evolutionary Advantage
    if (effect instanceof CheckPokemonPlayedTurnEffect && effect.target.getPokemonCard() === this) {
      if (state.turn === 2 && effect.target.pokemonPlayedTurn === 2) {
        effect.pokemonPlayedTurn = 1;
      }
    }

    return state;
  }

}
