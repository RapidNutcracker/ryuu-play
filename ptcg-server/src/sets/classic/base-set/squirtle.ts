import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Weakness, PlayerType, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { AddSpecialConditionsEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Squirtle extends PokemonCard {

  public id: number = 63;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.WATER;

  public hp: number = 40;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Bubble',
      cost: [CardType.WATER],
      damage: 10,
      text: 'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
    },
    {
      name: 'Withdraw',
      cost: [CardType.WATER, CardType.COLORLESS],
      damage: 0,
      text: 'Flip a coin. If heads, prevent all damage done to Squirtle during your opponent\'s next turn. (Any other effects of attacks still happen.)'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Squirtle';

  public fullName: string = 'Squirtle BS';

  public readonly WITHDRAW_MARKER = 'WITHDRAW_MARKER';

  public readonly CLEAR_WITHDRAW_MARKER = 'CLEAR_WITHDRAW_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Bubble
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    // Withdraw
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      state = store.prompt(state, new CoinFlipPrompt(
        player.id,
        GameMessage.COIN_FLIP
      ), flipResult => {
        if (flipResult) {
          player.active.marker.addMarker(this.WITHDRAW_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_WITHDRAW_MARKER, this);
        }
      });

      return state;
    }

    if (effect instanceof PutDamageEffect && effect.target.marker.hasMarker(this.WITHDRAW_MARKER)) {
      effect.preventDefault = true;
      return state;
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_WITHDRAW_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_WITHDRAW_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.WITHDRAW_MARKER, this);
      });
    }

    return state;
  }

}
