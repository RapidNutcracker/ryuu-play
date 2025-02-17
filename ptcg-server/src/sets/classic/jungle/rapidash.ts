import { AbstractAttackEffect } from '../../../game/store/effects/attack-effects';
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
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Rapidash extends PokemonCard {

  public id: number = 44;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Ponyta';

  public cardType: CardType = CardType.FIRE;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.WATER }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Stomp',
    cost: [CardType.FIRE],
    damage: 20,
    text:
      'Flip a coin. If heads, this attack does 20 damage plus 10 more damage; ' +
      'if tails, this attack does 20 damage.'
  }, {
    name: 'Agility',
    cost: [CardType.COLORLESS],
    damage: 20,
    text:
      'Flip a coin. If heads, during your opponent\'s next turn, ' +
      'prevent all effects of attacks, including damage, done to Rapidash.'
  }];

  public set: string = 'JU';

  public name: string = 'Rapidash';

  public fullName: string = 'Rapidash JU';

  public readonly CLEAR_AGILITY_MARKER = 'CLEAR_AGILITY_MARKER';

  public readonly AGILITY_MARKER = 'AGILITY_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Stomp
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === false) {
          effect.damage += 10;
        }
      });
    }

    // Agility
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
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
