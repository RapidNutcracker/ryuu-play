import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Card, ChooseEnergyPrompt, StateUtils, EnergyCard } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';

export class Poliwrath extends PokemonCard {

  public id: number = 13;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Poliwhirl';

  public cardType: CardType = CardType.WATER;

  public hp: number = 90;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Water Gun',
      cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS],
      damage: 30,
      text: 'Does 30 damage plus 10 more damage for each {W} Energy attached to Poliwrath but not used to pay for this attack\'s Energy cost. Extra {W} Energy after the 2nd doesn\'t count.'
    },
    {
      name: 'Whirlpool',
      cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
      damage: 40,
      text: 'If the Defending Pokémon has any Energy cards attached to it, choose 1 of them and discard it.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Poliwrath';

  public fullName: string = 'Poliwrath BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Water Gun
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      let additionalWaterEnergyCount = 0;
      checkProvidedEnergyEffect.energyMap.forEach(em => {
        const attachedWaterEnergy = em.provides.filter(cardType => {
          return cardType === CardType.WATER;
        }).length;
        const requiredWaterEnergy = effect.attack.cost.filter(cardType =>
          cardType === CardType.WATER
        ).length;

        additionalWaterEnergyCount = Math.max(attachedWaterEnergy - requiredWaterEnergy, 0);
      });
      effect.damage += Math.min(additionalWaterEnergyCount, 2) * 10;
    }

    // Whirlpool
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
