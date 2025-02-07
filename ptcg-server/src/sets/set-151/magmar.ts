import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, PlayerType, SlotType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class Magmar extends PokemonCard {

  public id: number = 126;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIRE;

  public hp: number = 90;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Live Coal',
    cost: [CardType.FIRE],
    damage: 10,
    text: ''
  }, {
    name: 'Flare Combo',
    cost: [CardType.FIRE, CardType.FIRE, CardType.COLORLESS],
    damage: 30,
    text: 'If Electabuzz is on your Bench, this attack does 80 more damage.'
  }];

  public set: string = 'MEW';

  public name: string = 'Magmar';

  public fullName: string = 'Magmar MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Flare Combo
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      let isMagmarOnBench = false;
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
        if (target.slot === SlotType.BENCH && card.name === 'Electabuzz') {
          isMagmarOnBench = true;
        }
      });

      if (!isMagmarOnBench) {
        return state;
      }

      effect.damage += 80;
    }

    return state;
  }
}
