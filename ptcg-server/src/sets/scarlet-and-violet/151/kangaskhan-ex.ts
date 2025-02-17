import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class KangaskhanEx extends PokemonCard {

  public id: number = 115;

  public tags: string[] = [CardTag.EX];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 230;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Triple Draw',
    cost: [CardType.COLORLESS],
    damage: 0,
    text: 'Draw 3 cards.'
  }, {
    name: 'Incessant Punching',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 0,
    text: 'Flip 4 coins. This attack does 100 damage for each heads.'
  }];

  public set: string = 'MEW';

  public name: string = 'Kangaskhan ex';

  public fullName: string = 'Kangaskhan ex MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Triple Draw
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      player.deck.moveTo(player.hand, 3);
    }

    // Iincessant Punching
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 100 * heads;
      });
    }

    return state;
  }
}
