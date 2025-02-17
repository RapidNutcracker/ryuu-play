import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Card, ChooseEnergyPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { DiscardCardsEffect } from '../../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';

export class Charmeleon extends PokemonCard {

  public id: number = 5;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Charmander';

  public cardTypes: CardType[] = [CardType.FIRE];

  public hp: number = 80;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Combustion',
      cost: [CardType.FIRE],
      damage: 20,
      text: ''
    },
    {
      name: 'Fire Blast',
      cost: [CardType.FIRE, CardType.FIRE, CardType.FIRE],
      damage: 90,
      text: 'Discard an Energy from this Pokémon.'
    },
  ];

  public set: string = 'MEW';

  public name: string = 'Charmeleon';

  public fullName: string = 'Charmeleon MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Fire Blast
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      return store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [CardType.ANY],
        { allowCancel: false }
      ), energy => {
        const cards: Card[] = (energy || []).map(e => e.card);
        const discardEnergy = new DiscardCardsEffect(effect, cards);
        discardEnergy.target = player.active;
        store.reduceEffect(state, discardEnergy);
      });
    }

    return state;
  }
}
