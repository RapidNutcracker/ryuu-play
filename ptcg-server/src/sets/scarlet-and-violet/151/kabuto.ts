import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { CoinFlipPrompt, GameMessage, Power, State, StoreLike } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';

export class Kabuto extends PokemonCard {

  public id: number = 140;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Antique Dome Fossil';

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 90;

  public weakness = [{ type: CardType.GRASS }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks = [{
    name: 'Double Scratch',
    cost: [CardType.FIGHTING],
    damage: 0,
    text: 'Flip 2 coins. This attack does 70 damage for each heads.'
  }];

  public set: string = 'MEW';

  public name: string = 'Kabuto';

  public fullName: string = 'Kabuto MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Double Scratch
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 70 * heads;
      });
    }

    return state;
  }
}
