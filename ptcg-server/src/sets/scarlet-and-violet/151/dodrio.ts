import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Attack, Power, PowerType, GameError, GameMessage, StateUtils, PokemonCardList, PlayerType } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Dodrio extends PokemonCard {

  public id: number = 85;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Doduo';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 100;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Zooming Draw',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text: 'Once during your turn, you may put 1 damage counter on this Pokémon. If you do, draw a card.'
  }];

  public attacks: Attack[] = [{
    name: 'Ballistic Beak',
    cost: [CardType.COLORLESS],
    damage: 10,
    text: 'This attack does 30 more damage for each damage counter on this Pokémon.'
  }];

  public set: string = 'MEW';

  public name: string = 'Dodrio';

  public fullName: string = 'Dodrio MEW';

  public readonly ZOOMING_DRAW_MARKER = 'ZOOMING_DRAW_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Zooming Draw
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const cardList = StateUtils.findCardList(state, this) as PokemonCardList;

      if (cardList.marker.hasMarker(this.ZOOMING_DRAW_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      cardList.marker.addMarker(this.ZOOMING_DRAW_MARKER, this);
      cardList.damage += 10;
      player.deck.moveTo(player.hand, 1);

      return state;
    }

    // Ballistic Beak
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage += effect.player.active.damage * 3;
    }

    // Clear Zooming Draw Marker
    if (effect instanceof EndTurnEffect) {
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER,
        (cardList) => cardList.marker.removeMarker(this.ZOOMING_DRAW_MARKER, this));
    }

    return state;
  }
}
