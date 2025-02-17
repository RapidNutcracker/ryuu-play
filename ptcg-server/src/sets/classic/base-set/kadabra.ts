import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Card, ChooseEnergyPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { DiscardCardsEffect } from '../../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';

export class Kadabra extends PokemonCard {

  public id: number = 32;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Abra';

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 60;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Recover',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC],
      damage: 0,
      text: 'Discard 1 {P} Energy card attached to Kadabra in order to use this attack. Remove all damage counters from Kadabra.'
    },
    {
      name: 'Super Psy',
      cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS],
      damage: 50,
      text: ''
    }
  ];

  public set: string = 'BS';

  public name: string = 'Kadabra';

  public fullName: string = 'Kadabra BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Recover
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      state = store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [CardType.PSYCHIC],
        { allowCancel: false }
      ), energy => {
        const cards: Card[] = (energy || []).map(e => e.card);
        const discardEnergy = new DiscardCardsEffect(effect, cards);
        discardEnergy.target = player.active;
        store.reduceEffect(state, discardEnergy);

        player.active.damage = 0;
      });

      return state;
    }

    return state;
  }
}
