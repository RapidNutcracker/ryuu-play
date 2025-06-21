import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Power, Resistance } from '../../../game/store/card/pokemon-types';
import { GameMessage } from '../../../game/game-message';
import { GameError } from '../../../game';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';


export class OriginFormeDialgaVStar extends PokemonCard {

  public id: number = 210;

  public tags: string[] = [CardTag.V];

  public stage: Stage = Stage.VSTAR

  public evolvesFrom: string = 'Origin Forme Dialga V';

  public cardTypes: CardType[] = [CardType.METAL];

  public hp: number = 280;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks = [{
    name: 'Metal Blast',
    cost: [CardType.COLORLESS],
    damage: 40,
    text:
      'This attack does 40 more damage for each {M} Energy attached to this Pokémon.'
  }, {
    name: 'Star Chronos',
    cost: [CardType.METAL, CardType.METAL, CardType.METAL, CardType.METAL, CardType.COLORLESS],
    damage: 220,
    text:
      'Take another turn after this one. (Skip Pokémon Checkup.) ' +
      '(You can\'t use more than 1 VSTAR Power in a game.)'
  }];

  public set: string = 'ASR';

  public name: string = 'Origin Forme Dialga VSTAR';

  public fullName: string = 'Origin Forme Dialga VSTAR ASR';

  private readonly STAR_CHRONOS_MARKER = 'TAKE_ANOTHER_TURN';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Metal Blast
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      let energyCount = 0;
      checkProvidedEnergyEffect.energyMap.forEach(em => {
        energyCount += em.provides.filter(cardType => {
          return cardType === CardType.METAL || cardType === CardType.ANY;
        }).length;
      });
      effect.damage += energyCount * 40;
      return state;
    }

    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      if (effect.player.usedVStarPower) {
        throw new GameError(GameMessage.VSTAR_POWER_ALREADY_USED);
      }

      effect.player.marker.addMarker(this.STAR_CHRONOS_MARKER, this);
      effect.player.usedVStarPower = true;
    }

    return state;
  }

}
