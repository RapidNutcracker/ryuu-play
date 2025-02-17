import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { CoinFlipPrompt, GameError, GameMessage, Resistance, State, StoreLike } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, KnockOutEffect } from '../../../game/store/effects/game-effects';

export class Farfetchd extends PokemonCard {

  public id: number = 27;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 50;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Leek Slap',
      cost: [CardType.COLORLESS],
      damage: 30,
      text:
        'Flip a coin. If tails, this attack does nothing. ' +
        'Either way, you can\'t use this attack again as long as Farfetch\'d stays in play ' +
        '(even putting Farfetch\'d on the Bench won\'t let you use it again).'
    },
    {
      name: 'Pot Smash',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 30,
      text: ''
    }
  ];

  public set: string = 'BS';

  public name: string = 'Farfetch\'d';

  public fullName: string = 'Farfetch\'d BS';

  public readonly LEEK_SLAP_MARKER = 'LEEK_SLAP_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Leek Slap
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      if (player.marker.hasMarker(this.LEEK_SLAP_MARKER, this)) {
        throw new GameError(GameMessage.ILLEGAL_ACTION);
      }

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === false) {
          effect.damage = 0;
        }

        player.marker.addMarker(this.LEEK_SLAP_MARKER, this);
      });
    }

    if (effect instanceof KnockOutEffect && effect.target.cards.includes(this)) {
      const player = effect.player;
      player.marker.removeMarker(this.LEEK_SLAP_MARKER, this);
    }

    return state;
  }

}
