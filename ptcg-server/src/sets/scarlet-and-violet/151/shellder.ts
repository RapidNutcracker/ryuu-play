import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { PlayerType, State, StateUtils, StoreLike, Weakness } from '../../../game';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Shellder extends PokemonCard {

  public id: number = 90;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Shell Press',
      cost: [CardType.WATER, CardType.WATER],
      damage: 30,
      text:
        'During your opponent\'s next turn, this Pokémon takes 30 ' +
        'less damage from attacks (after applying Weakness and Resistance).'
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Shellder';

  public fullName: string = 'Shellder MEW';

  public readonly SHELL_PRESS_MARKER = 'SHELL_PRESS_MARKER';

  public readonly CLEAR_SHELL_PRESS_MARKER = 'CLEAR_SHELL_PRESS_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Shell Press
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      player.active.marker.addMarker(this.SHELL_PRESS_MARKER, this);
      opponent.marker.addMarker(this.CLEAR_SHELL_PRESS_MARKER, this);

      return state;
    }

    // Shell Press is Active
    if (effect instanceof PutDamageEffect && effect.target.marker.hasMarker(this.SHELL_PRESS_MARKER)) {
      effect.damage = Math.max(effect.damage - 30, 0);

      return state;
    }

    // Clear Shell Press
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_SHELL_PRESS_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_SHELL_PRESS_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.SHELL_PRESS_MARKER, this);
      });
    }

    return state;
  }
}
