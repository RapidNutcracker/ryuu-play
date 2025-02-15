import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';
import { PlayItemEffect } from '../../game/store/effects/play-card-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { GameError, GameMessage, PlayerType, PokemonCardList } from '../../game';

export class PlusPower extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BS';

  public name: string = 'PlusPower';

  public fullName: string = 'PlusPower BS';

  public text: string =
    'Attach PlusPower to your Active Pokémon. ' +
    'At the end of your turn, discard PlusPower. ' +
    'If this Pokémon\'s attack does damage to the Defending Pokémon ' +
    '(after applying Weakness and Resistance), ' +
    'the attack does 10 more damage to the Defending Pokémon.';

  private readonly PLUSPOWER_MARKER = 'PLUSPOWER_MARKER';

  private readonly CLEAR_PLUSPOWER_MARKER = 'CLEAR_PLUSPOWER_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof PlayItemEffect && effect.trainerCard === this) {
      const player = effect.player;

      effect.preventDefault = true;

      const targetSlot = effect.target as PokemonCardList;

      if (targetSlot.getPokemonCard() === undefined) {
        throw new GameError(GameMessage.INVALID_TARGET);
      }

      player.hand.moveCardTo(this, effect.target as PokemonCardList);
      targetSlot.marker.addMarker(this.PLUSPOWER_MARKER, this);
      player.marker.addMarker(this.CLEAR_PLUSPOWER_MARKER, this);
    }

    if (effect instanceof PutDamageEffect && effect.source.marker.hasMarker(this.PLUSPOWER_MARKER, this)) {
      if (effect.damage > 0) {
        effect.damage += 10;
      }
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_PLUSPOWER_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_PLUSPOWER_MARKER, this);

      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.PLUSPOWER_MARKER, this);
        cardList.moveCardTo(this, effect.player.discard);
      });
    }

    return state;
  }

}
