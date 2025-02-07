import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, PlayerType, SlotType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';

export class Electabuzz extends PokemonCard {

  public id: number = 125;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 90;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Electro Combo',
    cost: [CardType.LIGHTNING],
    damage: 10,
    text: 'If Magmar is on your Bench, this attack does 40 more damage.'
  }, {
    name: 'Light Punch',
    cost: [CardType.LIGHTNING, CardType.COLORLESS],
    damage: 30,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Electabuzz';

  public fullName: string = 'Electabuzz MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Electro Combo
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      let isMagmarOnBench = false;
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
        if (target.slot === SlotType.BENCH && card.name === 'Magmar') {
          isMagmarOnBench = true;
        }
      });

      if (!isMagmarOnBench) {
        return state;
      }

      effect.damage += 40;
    }

    return state;
  }
}
