import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { Power, PowerType } from '../../../game/store/card/pokemon-types';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { PlayerType, PokemonCardList, StateUtils } from '../../../game';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class RaikouV extends PokemonCard {

  public id: number = 48;

  public tags: string[] = [CardTag.V];

  public stage: Stage = Stage.BASIC

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 200;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Fleet-Footed',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your turn, if this Pokémon is in the Active Spot, you may draw a card.'
  }];

  public attacks = [{
    name: 'Lightning Rondo',
    cost: [CardType.LIGHTNING, CardType.COLORLESS],
    damage: 20,
    text: 'This attack does 20 more damage for each Benched Pokémon (both yours and your opponent\'s).'
  }];

  public set: string = 'BRS';

  public name: string = 'Raikou V';

  public fullName: string = 'Raikou V BRS';

  private readonly FLEET_FOOTED_MARKER = 'FLEET_FOOTED_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Fleet-Footed
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const slot = StateUtils.findCardList(state, this) as PokemonCardList;

      if (player.deck.cards.length === 0 || player.active.getPokemonCard() !== this) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (slot.marker.hasMarker(this.FLEET_FOOTED_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      slot.marker.addMarker(this.FLEET_FOOTED_MARKER, this);
      player.deck.moveTo(player.hand, 1);
    }

    // Lightning Rondo
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      let numberOfBenchedPokemon = 0;
      player.bench.forEach(b => numberOfBenchedPokemon += b.cards.length > 0 ? 1 : 0);
      opponent.bench.forEach(b => numberOfBenchedPokemon += b.cards.length > 0 ? 1 : 0);

      effect.damage += 20 * numberOfBenchedPokemon;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.FLEET_FOOTED_MARKER, this);
      });
    }

    return state;
  }
}
