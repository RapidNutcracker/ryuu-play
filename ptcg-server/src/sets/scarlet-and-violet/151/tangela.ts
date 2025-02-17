import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, PlayerType, StateUtils, Attack, PokemonCardList } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { PlaySupporterEffect } from '../../../game/store/effects/play-card-effects';
import { DealDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Tangela extends PokemonCard {

  public id: number = 114;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 80;

  public weakness: Weakness[] = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Tactful Tangling',
    cost: [CardType.GRASS],
    damage: 10,
    text: 'If you played Erika\'s Invitation from your hand during this turn, this attack does 60 more damage.'
  }];

  public set: string = 'MEW';

  public name: string = 'Tangela';

  public fullName: string = 'Tangela MEW';

  public readonly PLAYED_ERIKAS_INVITATION = 'PLAYED_ERIKAS_INVITATION';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Boost Tactful Tangling
    if (effect instanceof PlaySupporterEffect && effect.trainerCard.name === 'Erika\'s Invitation') {

      const slot = StateUtils.findCardList(state, this);

      if (!(slot instanceof PokemonCardList)) {
        return state;
      }

      if (effect.player === StateUtils.findOwner(state, slot)) {
        slot.marker.addMarker(this.PLAYED_ERIKAS_INVITATION, effect.trainerCard);
      }
    }

    // Tactful Tangling
    if (effect instanceof DealDamageEffect && effect.attack === this.attacks[1]) {
      if (effect.source.marker.hasMarker(this.PLAYED_ERIKAS_INVITATION)) {
        effect.damage += 60;
      }

      return state;
    }

    // Clear Tactful Tangling Boost
    if (effect instanceof EndTurnEffect) {
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER,
        (cardList) => {
          cardList.marker.removeMarker(this.PLAYED_ERIKAS_INVITATION);
        });
    }

    return state;
  }

}
