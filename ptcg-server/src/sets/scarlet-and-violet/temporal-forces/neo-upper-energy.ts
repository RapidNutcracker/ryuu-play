import { CardTag, CardType, EnergyType, Stage } from '../../../game/store/card/card-types';
import { EnergyCard } from '../../../game/store/card/energy-card';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';

export class NeoUpperEnergy extends EnergyCard {

  public id: number = 162;

  public tags: string[] = [CardTag.ACE_SPEC];

  public provides: CardType[] = [];

  public energyType = EnergyType.SPECIAL;

  public set: string = 'TEF';

  public name = 'Neo Upper Energy';

  public fullName = 'Neo Upper Energy TEF';

  public text =
    'As long as this card is attached to a Pokémon, it provides {C} Energy.' +
    '\n' +
    'If this card is attached to a Stage 2 Pokémon, ' +
    'this card provides every type of Energy but provides only 2 Energy at a time.';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof CheckProvidedEnergyEffect && effect.source.cards.includes(this)) {
      const pokemonCard = effect.source.getPokemonCard();

      if (pokemonCard !== undefined) {
        let provides = [CardType.COLORLESS];

        if (pokemonCard.stage === Stage.STAGE_2) {
          provides = [CardType.ANY, CardType.ANY];
        }

        effect.energyMap.push({ card: this, provides });
      }
    }

    return state;
  }

}
