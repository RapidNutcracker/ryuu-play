import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { DealDamageEffect } from '../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class GolemEx extends PokemonCard {

  public id: number = 78;

  public tags: string[] = [CardTag.POKEMON_EX];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Graveler';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 330;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Dynamic Roll',
    cost: [CardType.FIGHTING],
    damage: 50,
    text:
      'During your next turn, attacks used by this Pokémon do 120 more damage ' +
      'to your opponent\'s Active Pokémon (before applying Weakness and Resistance).'
  }, {
    name: 'Rock Blaster',
    cost: [CardType.FIGHTING, CardType.COLORLESS, CardType.COLORLESS],
    damage: 180,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Golem ex';

  public fullName: string = 'Golem ex MEW';

  public readonly DYNAMIC_ROLL_MARKER = 'DYNAMIC_ROLL_MARKER';

  private DYNAMIC_ROLL_TURN_NUMBER: number = 0


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Dynamic Roll
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      player.active.marker.addMarker(this.DYNAMIC_ROLL_MARKER, this);
      this.DYNAMIC_ROLL_TURN_NUMBER = state.turn;

      return state;
    }

    // Dynamic Roll Active
    if (effect instanceof DealDamageEffect && effect.source.getPokemonCard() === this) {

      if (effect.source.marker.hasMarker(this.DYNAMIC_ROLL_MARKER)) {
        effect.damage += 120;
      }

      return state;
    }

    // Clear Dynamic Roll
    if (effect instanceof EndTurnEffect &&
      effect.player.active.marker.hasMarker(this.DYNAMIC_ROLL_MARKER, this) &&
      state.turn > this.DYNAMIC_ROLL_TURN_NUMBER
    ) {
      effect.player.active.marker.removeMarker(this.DYNAMIC_ROLL_MARKER, this);
    }

    return state;
  }
}
