import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Weakness, Card, ChooseEnergyPrompt, EnergyCard, StateUtils } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';

export class Dragonair extends PokemonCard {

  public id: number = 18;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Dratini';

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 80;

  public weakness: Weakness[] = [];

  public resistance: Resistance[] = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Slam',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 30,
      text: 'Flip 2 coins. This attack does 30 damage times the number of heads.'
    },
    {
      name: 'Hyper Beam',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 20,
      text: 'If the Defending Pokémon has any Energy cards attached to it, choose 1 of them and discard it.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Dragonair';

  public fullName: string = 'Dragonair BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Slam
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 30 * heads;
      });
    }

    // Hyper Beam
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const targetHasEnergy = opponent.active.cards.some(c => c instanceof EnergyCard);

      if (!targetHasEnergy) {
        return state;
      }

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(opponent);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      return store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergyEffect.energyMap,
        [CardType.ANY],
        { allowCancel: false }
      ), energy => {
        const cards: Card[] = (energy || []).map(e => e.card);
        const discardEnergy = new DiscardCardsEffect(effect, cards);
        discardEnergy.target = opponent.active;
        store.reduceEffect(state, discardEnergy);
      });
    }

    return state;
  }

}
