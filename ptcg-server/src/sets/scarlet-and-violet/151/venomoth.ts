import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';
import { PlayItemEffect } from '../../../game/store/effects/play-card-effects';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Resistance } from '../../../game/store/card/pokemon-types';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StateUtils, GameMessage, GameError } from '../../../game';
import { StoreLike } from '../../../game/store/store-like';

export class Venomoth extends PokemonCard {

  public id: number = 49;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 90;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Perplexing Powder',
    cost: [CardType.GRASS],
    damage: 30,
    text:
      'Your opponent\'s Active Pokémon is now Confused. ' +
      'During your opponent\'s next turn, they can\'t play any Item cards from their hand.'
  }, {
    name: 'Speed Wing',
    cost: [CardType.GRASS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 90,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Venomoth';

  public fullName: string = 'Venomoth MEW';

  public readonly PERPLEXING_POWDER_MARKER = 'PERPLEXING_POWDER_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Perplexing Powder
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.CONFUSED]);
      store.reduceEffect(state, specialConditionEffect);

      opponent.marker.addMarker(this.PERPLEXING_POWDER_MARKER, this);
    }

    // Perplexing Powder Active
    if (effect instanceof PlayItemEffect) {
      const player = effect.player;
      if (player.marker.hasMarker(this.PERPLEXING_POWDER_MARKER, this)) {
        throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
      }
    }

    // Clear Perplexing Powder
    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.PERPLEXING_POWDER_MARKER, this);
    }

    return state;
  }
}
