import { PowerEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Power, PowerType, Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { Stage, CardType, CardTag, EnergyType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { CheckHpEffect } from '../../../game/store/effects/check-effects';
import { EnergyCard, PlayerType, PokemonCardList, StateUtils } from '../../../game';
import { PlaySupporterEffect } from '../../../game/store/effects/play-card-effects';
import { DealDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class WigglytuffEx extends PokemonCard {

  public id: number = 40;

  public tags: string[] = [CardTag.EX];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Jigglypuff'

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 250;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Expanding Body',
    powerType: PowerType.ABILITY,
    text: 'If this Pokémon has any Special Energy attached, it gets +100 HP.'
  }];

  public attacks = [{
    name: 'Friend Tackle',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 90,
    text:
      'If you played a Supporter card from your hand during this turn, this attack does 90 more damage.'
  }];

  public set: string = 'MEW';

  public name: string = 'Wigglytuff ex';

  public fullName: string = 'Wigglytuff ex MEW';

  public readonly FRIEND_TACKLE_MARKER = 'FRIEND_TACKLE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Expanding Body
    if (effect instanceof CheckHpEffect && effect.target.cards.includes(this)) {
      const player = effect.player;

      // Try to reduce PowerEffect, to check if something is blocking our ability
      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        state = store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      const hasSpecialEnergyAttached = effect.target.cards.some(c =>
        c instanceof EnergyCard &&
        c.energyType === EnergyType.SPECIAL
      );

      if (hasSpecialEnergyAttached) {
        effect.hp += 100;
      }

      return state;
    }

    // Boost Friend Tackle
    if (effect instanceof PlaySupporterEffect) {
      const slot = StateUtils.findCardList(state, this);

      if (!(slot instanceof PokemonCardList)) {
        return state;
      }

      if (effect.player === StateUtils.findOwner(state, slot)) {
        slot.marker.addMarker(this.FRIEND_TACKLE_MARKER, this);
      }
    }

    // Friend Tackle
    if (effect instanceof DealDamageEffect && effect.attack === this.attacks[0]) {
      if (effect.source.marker.hasMarker(this.FRIEND_TACKLE_MARKER, this)) {
        effect.damage += 90;
      }

      return state;
    }

    // Clear Friend Tackle Boost
    if (effect instanceof EndTurnEffect) {
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER,
        (cardList) => {
          cardList.marker.removeMarker(this.FRIEND_TACKLE_MARKER, this);
        });
    }

    return state;
  }
}
