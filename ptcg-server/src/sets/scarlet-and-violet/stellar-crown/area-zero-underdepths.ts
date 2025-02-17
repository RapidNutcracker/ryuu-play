import { Effect } from '../../../game/store/effects/effect';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';
import { TrainerCard } from '../../../game/store/card/trainer-card';
import { CardTag, TrainerType } from '../../../game/store/card/card-types';
import { StateUtils } from '../../../game/store/state-utils';
import { UseStadiumEffect } from '../../../game/store/effects/game-effects';
import { CheckTableStateEffect } from '../../../game/store/effects/check-effects';
// import { PlayPokemonEffect, PlayStadiumEffect } from '../../../game/store/effects/play-card-effects';

export class AreaZeroUnderdepths extends TrainerCard {

  public id: number = 131;

  public trainerType: TrainerType = TrainerType.STADIUM;

  public set: string = 'SCR';

  public name: string = 'Area Zero Underdepths';

  public fullName: string = 'Area Zero Underdepths SCR';

  public text: string =
    'Each player who has any Tera Pokémon in play can have up to 8 Pokémon on their Bench.' +
    '\n' +
    'If a player no longer has any Tera Pokémon in play, ' +
    'that player discards Pokémon from their Bench until they have 5. ' +
    'When this card leaves play, both players discard Pokémon from their Bench until they have 5, ' +
    'and the player who played this card discards first.';

  // private readonly AREA_ZERO_UNDERDEPTHS_MARKER = 'AREA_ZERO_UNDERDEPTHS_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // if (effect instanceof PlayStadiumEffect && effect.trainerCard === this) {

    // }

    // if (effect instanceof PlayPokemonEffect && StateUtils.getStadiumCard(state) === this) {
    //   if (effect.pokemonCard.tags.includes(CardTag.TERA)) {

    //   }
    // }

    if (effect instanceof CheckTableStateEffect && StateUtils.getStadiumCard(state) === this) {
      state.players.forEach((player, playerNumber) => {
        if ([player.active, ...player.bench].some(slot => slot.getPokemonCard()?.tags.includes(CardTag.TERA))) {
          // const playerNumber = state.players.findIndex(({ id }) => id === player.id);
          effect.benchSize[playerNumber] = 8;
        }
      })
    }

    if (effect instanceof UseStadiumEffect && StateUtils.getStadiumCard(state) === this) {
      throw new GameError(GameMessage.CANNOT_USE_STADIUM);
    }

    return state;
  }

}
