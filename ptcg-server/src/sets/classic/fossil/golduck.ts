import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt, Card, ChooseEnergyPrompt, EnergyCard, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect, AfterDamageEffect, DiscardCardsEffect } from '../../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';

export class Golduck extends PokemonCard {

  public id: number = 35;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Psyduck';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 70;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Psyshock',
    cost: [CardType.PSYCHIC],
    damage: 10,
    text:
      'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
  }, {
    name: 'Hyper Beam',
    cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS],
    damage: 20,
    text:
      'If the Defending Pokémon has any Energy cards attached to it, choose 1 of them and discard it.'
  }];

  public set: string = 'FO';

  public name: string = 'Golduck';

  public fullName: string = 'Golduck FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Psyshock
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect.attackEffect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
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
