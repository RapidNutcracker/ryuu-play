import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { Attack, Power } from '../../../game/store/card/pokemon-types';
import { StateUtils } from '../../../game/store/state-utils';
import { PokemonCardList } from '../../../game';
import { AfterDamageEffect } from '../../../game/store/effects/attack-effects';
import { CheckTableStateEffect } from '../../../game/store/effects/check-effects';

export class GougingFireEx extends PokemonCard {

  public id: number = 38;

  public tags: string[] = [CardTag.EX, CardTag.ANCIENT];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 230;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Heat Blast',
    cost: [CardType.FIRE, CardType.COLORLESS],
    damage: 60,
    text: 'This Pokémon can\'t use Blaze Blitz again until it leaves the Active Spot.'
  }, {
    name: 'Blaze Blitz',
    cost: [CardType.FIRE, CardType.FIRE, CardType.COLORLESS],
    damage: 260,
    text: 'This Pokémon can\'t use Blaze Blitz again until it leaves the Active Spot.'
  }];

  public set: string = 'TEF';

  public name: string = 'Gouging Fire ex';

  public fullName: string = 'Gouging Fire ex TEF';

  private readonly BLAZE_BLITZ_MARKER = 'BLAZE_BLITZ_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Blaze Blitz
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      effect.source.marker.addMarker(this.BLAZE_BLITZ_MARKER, this);
    }

    // Clear Blaze Blitz
    if (effect instanceof CheckTableStateEffect) {
      const slot = StateUtils.findCardList(state, this);

      if (!(slot instanceof PokemonCardList)) {
        return state;
      }

      if (slot.marker.hasMarker(this.BLAZE_BLITZ_MARKER, this)) {
        const owner = StateUtils.findOwner(state, slot);
        const benchIndex = owner.bench.indexOf(slot);
        if (benchIndex === -1) {
          slot.marker.removeMarker(this.BLAZE_BLITZ_MARKER, this);
        }
      }
    }

    return state;
  }

}
