import { AttackEffect } from '../../game/store/effects/game-effects';
import { Card } from '../../game/store/card/card';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { ChooseEnergyPrompt } from '../../game/store/prompts/choose-energy-prompt';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';
import { Effect } from '../../game/store/effects/effect';
import { GameMessage } from '../../game/game-message';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { State } from '../../game/store/state/state';
import { StoreLike } from '../../game/store/store-like';

export class CharizardEx extends PokemonCard {

  public id: number = 6;

  public tags: string[] = [CardTag.EX];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Charmeleon';

  public cardType: CardType = CardType.FIRE;

  public hp: number = 330;

  public weakness = [{ type: CardType.WATER }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [];

  public attacks = [
    {
      name: 'Brave Wing',
      cost: [CardType.FIRE],
      damage: 60,
      text: 'If this Pokémon has any damage counters on it, this attack does 100 more damage.'
    },
    {
      name: 'Explosive Vortex',
      cost: [CardType.FIRE, CardType.FIRE, CardType.FIRE, CardType.FIRE],
      damage: 330,
      text: 'Discard 3 Energy from this Pokémon.'
    },
  ];

  public set: string = 'MEW';

  public name: string = 'Charizard ex';

  public fullName: string = 'Charizard ex MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Brave Wing
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      if (effect.player.active.damage > 0) {
        effect.damage += 100;
      }
      return state;
    }

    // Explosive Vortex
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      state = store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [CardType.ANY, CardType.ANY, CardType.ANY],
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
