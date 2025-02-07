import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, PlayerType, StateUtils, Attack, PokemonCardList } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { PlaySupporterEffect } from '../../game/store/effects/play-card-effects';
import { DealDamageEffect } from '../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class Rhydon extends PokemonCard {

  public id: number = 112;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Rhyhorn';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 120;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Wrack Down',
    cost: [CardType.FIGHTING, CardType.COLORLESS],
    damage: 30,
    text: ''
  }, {
    name: 'Charismatic Drill',
    cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.COLORLESS],
    damage: 40,
    text: 'If you played Giovanni\'s Charisma from your hand during this turn, this attack does 140 more damage.'
  }];

  public set: string = 'MEW';

  public name: string = 'Rhydon';

  public fullName: string = 'Rhydon MEW';

  public readonly PLAYED_GIOVANNIS_CHARISMA_MARKER = 'PLAYED_GIOVANNIS_CHARISMA_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Boost Charismatic Drill
    if (effect instanceof PlaySupporterEffect && effect.trainerCard.name === 'Giovanni\'s Charisma') {

      const slot = StateUtils.findCardList(state, this);

      if (!(slot instanceof PokemonCardList)) {
        return state;
      }

      if (effect.player === StateUtils.findOwner(state, slot)) {
        slot.marker.addMarker(this.PLAYED_GIOVANNIS_CHARISMA_MARKER, effect.trainerCard);
      }
    }

    // Charismatic Drill
    if (effect instanceof DealDamageEffect && effect.attack === this.attacks[1]) {
      if (effect.source.marker.hasMarker(this.PLAYED_GIOVANNIS_CHARISMA_MARKER)) {
        effect.damage += 140;
      }

      return state;
    }

    // Clear Charismatic Drill Boost
    if (effect instanceof EndTurnEffect) {
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER,
        (cardList) => {
          cardList.marker.removeMarker(this.PLAYED_GIOVANNIS_CHARISMA_MARKER);
        });
    }

    return state;
  }

}
