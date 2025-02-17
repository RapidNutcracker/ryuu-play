import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, GameMessage, StateUtils, PlayerType } from '../../../game';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Magmar extends PokemonCard {

  public id: number = 39;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIRE;

  public hp: number = 70;

  public weakness = [{ type: CardType.WATER }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Smokescreen',
    cost: [CardType.FIRE],
    damage: 10,
    text:
      'If the Defending Pokémon tries to attack during your opponent\'s next turn, your opponent flips a coin. ' +
      'If tails, that attack does nothing.'
  }, {
    name: 'Smog',
    cost: [CardType.FIRE, CardType.FIRE],
    damage: 20,
    text: 'Flip a coin. If heads, the Defending Pokémon is now Poisoned.'
  }];

  public set: string = 'FO';

  public name: string = 'Magmar';

  public fullName: string = 'Magmar FO';

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

    // Smog
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.POISONED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    // Attacked by Smokescreen Target
    if (effect instanceof AttackEffect && effect.player.active.marker.hasMarker(this.SMOKESCREEN_MARKER, this)) {
      return store.prompt(state, [
        new CoinFlipPrompt(effect.player.id, GameMessage.COIN_FLIP)
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
