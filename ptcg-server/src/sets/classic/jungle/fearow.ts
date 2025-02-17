import { AttackEffect } from '../../../game/store/effects/game-effects';
import {
  CoinFlipPrompt,
  GameMessage,
  PlayerType,
  Resistance,
  State,
  StateUtils,
  StoreLike,
  Weakness
} from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { AbstractAttackEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Fearow extends PokemonCard {

  public id: number = 36;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Spearow';

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public attacks = [{
    name: 'Agility',
    cost: [CardType.COLORLESS],
    damage: 20,
    text:
      'Flip a coin. If heads, during your opponent\'s next turn, ' +
      'prevent all effects of attacks, including damage, done to Fearow.'
  }, {
    name: 'Drill Peck',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 40,
    text: ''
  }];

  public set: string = 'JU';

  public name: string = 'Fearow';

  public fullName: string = 'Fearow JU';

  public readonly CLEAR_AGILITY_MARKER = 'CLEAR_AGILITY_MARKER';

  public readonly AGILITY_MARKER = 'AGILITY_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Agility
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      state = store.prompt(state, new CoinFlipPrompt(
        player.id, GameMessage.COIN_FLIP
      ), flipResult => {
        if (flipResult) {
          player.active.marker.addMarker(this.AGILITY_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_AGILITY_MARKER, this);
        }
      });

      return state;
    }

    // Has Agility Up
    if (effect instanceof AbstractAttackEffect
      && effect.target.marker.hasMarker(this.AGILITY_MARKER)) {
      effect.preventDefault = true;
      return state;
    }

    // Remove Agility
    if (effect instanceof EndTurnEffect
      && effect.player.marker.hasMarker(this.CLEAR_AGILITY_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_AGILITY_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.AGILITY_MARKER, this);
      });
    }

    return state;
  }

}
