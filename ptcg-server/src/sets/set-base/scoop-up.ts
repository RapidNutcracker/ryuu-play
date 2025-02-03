import { GameMessage } from '../../game/game-message';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType, Stage } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { ChoosePokemonPrompt } from '../../game/store/prompts/choose-pokemon-prompt';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { PlayerType, PokemonCard, SlotType } from '../../game';


export class ScoopUp extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public tags = [ ];

  public set: string = 'BS';

  public name: string = 'Scoop Up';

  public fullName: string = 'Scoop Up BS';

  public text: string =
    'Choose 1 of your Pokémon in play and return its Basic Pokémon card to your hand. ' +
    '(Discard all cards attached to that card.)';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const player = effect.player;

      // We will discard this card after prompt confirmation
      effect.preventDefault = true;

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_PICK_UP,
        PlayerType.BOTTOM_PLAYER,
        [ SlotType.ACTIVE, SlotType.BENCH ],
        { allowCancel: true }
      ), result => {
        const targets = result || [];

        // Operation cancelled by user
        if (targets.length === 0) {
          return;
        }

        // Discard trainer card
        player.hand.moveCardTo(this, player.discard);

        targets.forEach(target => {
          const basic_pokemon_cards: PokemonCard[] = target.getPokemons().filter(p => p.stage == Stage.BASIC)

          if (basic_pokemon_cards.length > 0) {
            target.moveCardsTo(basic_pokemon_cards, player.hand);
          }
          
          target.moveTo(player.discard);
          target.clearEffects();
        });
      });
    }

    return state;
  }

}
