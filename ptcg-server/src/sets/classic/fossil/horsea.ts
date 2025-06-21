import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt, PlayerType, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { DealDamageEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Horsea extends PokemonCard {

  public id: number = 49;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 40;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [];

  public attacks = [{
    name: 'Smokescreen',
    cost: [CardType.WATER],
    damage: 10,
    text:
      'If the Defending Pokémon tries to attack during your opponent\'s next turn, ' +
      'your opponent flips a coin. If tails, that attack does nothing.'
  }];

  public set: string = 'FO';

  public name: string = 'Horsea';

  public fullName: string = 'Horsea FO';

  public readonly SMOKESCREEN_MARKER = 'SMOKESCREEN_MARKER';

  public readonly CLEAR_SMOKESCREEN_MARKER = 'CLEAR_SMOKESCREEN_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Smokescreen
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      opponent.active.marker.addMarker(this.SMOKESCREEN_MARKER, this);
      opponent.marker.addMarker(this.CLEAR_SMOKESCREEN_MARKER, this);

      return state;
    }

    if (effect instanceof DealDamageEffect && effect.source.marker.hasMarker(this.SMOKESCREEN_MARKER)) {
      const attackerOwner = StateUtils.findOwner(state, effect.source);

      return store.prompt(state, [
        new CoinFlipPrompt(attackerOwner.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === false) {
          effect.preventDefault = true;
        }
      });
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_SMOKESCREEN_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_SMOKESCREEN_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.SMOKESCREEN_MARKER, this);
      });
    }

    return state;
  }
}
