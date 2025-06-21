import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { Power, PowerType, Resistance } from '../../../game/store/card/pokemon-types';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { ShufflePrompt } from '../../../game';

export class PidgeotV extends PokemonCard {

  public id: number = 137;

  public tags: string[] = [CardTag.V];

  public stage: Stage = Stage.BASIC

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 210;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Vanishing Wings',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your turn, ' +
      'if this Pokémon is on your Bench, ' +
      'you may shuffle it and all attached cards into your deck.'
  }];

  public attacks = [{
    name: 'Flight Surf',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 80,
    text:
      'If you have a Stadium in play, this attack does 80 more damage.'
  }];

  public set: string = 'LOR';

  public name: string = 'Pidgeot V';

  public fullName: string = 'Pidgeot V LOR';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Vanishing Wings
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      // Pidgeot V is not on the bench
      const benchIndex = player.bench.findIndex(benchSlot => benchSlot.getPokemonCard() === this);
      if (benchIndex === -1) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      player.bench[benchIndex].moveTo(player.deck);

      return store.prompt(state, new ShufflePrompt(player.id), order => {
        player.deck.applyOrder(order);
      });
    }

    // Scrap Short
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      if (effect.player.stadium.cards.length > 0) {
        effect.damage += 80;
      }
    }

    return state;
  }

}
