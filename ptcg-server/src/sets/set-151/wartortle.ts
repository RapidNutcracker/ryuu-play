import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, EnergyType, SuperType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, ChooseCardsPrompt, EnergyCard } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';

export class Wartortle extends PokemonCard {

  public id: number = 8;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Squirtle';

  public cardType: CardType = CardType.WATER;

  public hp: number = 100;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Free Diving',
      cost: [CardType.WATER],
      damage: 0,
      text: 'Put up to 3 Basic {W} Energy cards from your discard pile into your hand.'
    },
    {
      name: 'Spinning Attack',
      cost: [CardType.WATER, CardType.WATER],
      damage: 50,
      text: ''
    }
  ];

  public set: string = 'MEW';

  public name: string = 'Wartortle';

  public fullName: string = 'Wartortle MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Free Diving
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      // Player has no Basic Energy in the discard pile
      let basicEnergyCards = 0;
      player.discard.cards.forEach(c => {
        if (c instanceof EnergyCard && c.energyType === EnergyType.BASIC) {
          basicEnergyCards++;
        }
      });

      if (basicEnergyCards === 0) {
        return state;
      }

      return store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_HAND,
        player.discard,
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.WATER] },
        { min: 1, max: 3, allowCancel: false }
      ), selected => {
        player.discard.moveCardsTo(selected, player.hand);
      });
    }

    return state;
  }

}
