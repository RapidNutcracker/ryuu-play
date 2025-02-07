import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { Resistance, State, StoreLike, Weakness } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class Ponyta extends PokemonCard {

  public id: number = 77;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIRE;

  public hp: number = 70;

  public weakness: Weakness[] = [{ type: CardType.WATER }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Collect',
    cost: [CardType.FIRE],
    damage: 0,
    text: 'Draw a card.'
  }, {
    name: 'Flop',
    cost: [CardType.FIRE, CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Ponyta';

  public fullName: string = 'Ponyta MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Collect
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      player.deck.moveTo(player.hand, 1);
    }

    return state;
  }
}
