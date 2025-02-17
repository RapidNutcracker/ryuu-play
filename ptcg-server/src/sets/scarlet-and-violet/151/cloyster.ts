import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { PlayerType, State, StateUtils, StoreLike, Weakness } from '../../../game';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Cloyster extends PokemonCard {

  public id: number = 91;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Shellder';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 130;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Protect Charge',
      cost: [CardType.WATER, CardType.WATER],
      damage: 80,
      text:
        'During your opponent\'s next turn, this Pokémon takes 80 ' +
        'less damage from attacks (after applying Weakness and Resistance).'
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Cloyster';

  public fullName: string = 'Cloyster MEW';

  public readonly PROTECT_CHARGE_MARKER = 'PROTECT_CHARGE_MARKER';

  public readonly CLEAR_PROTECT_CHARGE_MARKER = 'CLEAR_PROTECT_CHARGE_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Protect Charge
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      player.active.marker.addMarker(this.PROTECT_CHARGE_MARKER, this);
      opponent.marker.addMarker(this.CLEAR_PROTECT_CHARGE_MARKER, this);

      return state;
    }

    // Protect Charge is Active
    if (effect instanceof PutDamageEffect && effect.target.marker.hasMarker(this.PROTECT_CHARGE_MARKER)) {
      effect.damage = Math.max(effect.damage - 80, 0);

      return state;
    }

    // Clear Protect Charge
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_PROTECT_CHARGE_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_PROTECT_CHARGE_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.PROTECT_CHARGE_MARKER, this);
      });
    }

    return state;
  }
}
