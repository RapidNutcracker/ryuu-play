import { StoreLike, State, StateUtils, PlayerType, Resistance, GamePhase } from '../../game';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { AfterDamageEffect } from '../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class Mewtwo extends PokemonCard {

  public id: number = 150;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 130;

  public weakness = [{ type: CardType.DARK }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Reflective Barrier',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text: 'During your opponent\'s next turn, if this Pokémon is damaged by an attack '
      + '(even if it is Knocked Out), put damage counters on the Attacking Pokémon ' +
      'equal to the damage done to this Pokémon.'
  }, {
    name: 'Psyslash',
    cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS],
    damage: 130,
    text: 'Discard 2 Energy from this Pokémon.'
  }];

  public set: string = 'MEW';

  public name: string = 'Mewtwo';

  public fullName: string = 'Mewtwo MEW';

  private readonly REFLECTIVE_BARRIER_MARKER = 'REFLECTIVE_BARRIER_MARKER';

  private readonly CLEAR_REFLECTIVE_BARRIER_MARKER = 'CLEAR_REFLECTIVE_BARRIER_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Reflective Barrier
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      player.active.marker.addMarker(this.REFLECTIVE_BARRIER_MARKER, this);
      opponent.marker.addMarker(this.CLEAR_REFLECTIVE_BARRIER_MARKER, this);

      return state;
    }

    if (effect instanceof AfterDamageEffect && effect.target.marker.hasMarker(this.REFLECTIVE_BARRIER_MARKER, this)) {
      const player = effect.player;
      const targetPlayer = StateUtils.findOwner(state, effect.target);

      if (player === targetPlayer || targetPlayer.active !== effect.target) {
        return state;
      }

      if (state.phase === GamePhase.ATTACK) {
        effect.source.damage += effect.damage;
      }
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_REFLECTIVE_BARRIER_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_REFLECTIVE_BARRIER_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.REFLECTIVE_BARRIER_MARKER, this);
      });
    }

    return state;
  }

}
