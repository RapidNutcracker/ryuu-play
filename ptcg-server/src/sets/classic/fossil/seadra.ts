import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, CoinFlipPrompt, PlayerType, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';
import { AbstractAttackEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Seadra extends PokemonCard {

  public id: number = 43;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Horsea';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 60;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Water Gun',
    cost: [CardType.WATER, CardType.COLORLESS],
    damage: 20,
    text:
      'Does 20 damage plus 10 more damage for each {W} Energy attached to Seadra ' +
      'but not used to pay for this attack\'s Energy cost. ' +
      'You can\'t add more than 20 damage in this way.'
  }, {
    name: 'Agility',
    cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
    damage: 20,
    text:
      'Flip a coin. ' +
      'If heads, during your opponent\'s next turn, prevent all effects of attacks, ' +
      'including damage, done to Seadra.'
  }];

  public set: string = 'FO';

  public name: string = 'Seadra';

  public fullName: string = 'Seadra FO';

  public readonly CLEAR_AGILITY_MARKER = 'CLEAR_AGILITY_MARKER';

  public readonly AGILITY_MARKER = 'AGILITY_MARKER';

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

    // Agility
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      state = store.prompt(state, new CoinFlipPrompt(
        player.id, GameMessage.COIN_FLIP
      ), flipResult => {
        if (flipResult) {
          player.active.marker.addMarker(this.AGILITY_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_AGILITY_MARKER, this);
        }
      });

      return state;
    }

    // Has Agility Up
    if (effect instanceof AbstractAttackEffect
      && effect.target.marker.hasMarker(this.AGILITY_MARKER)) {
      effect.preventDefault = true;
      return state;
    }

    // Remove Agility
    if (effect instanceof EndTurnEffect
      && effect.player.marker.hasMarker(this.CLEAR_AGILITY_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_AGILITY_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.AGILITY_MARKER, this);
      });
    }

    return state;
  }
}
