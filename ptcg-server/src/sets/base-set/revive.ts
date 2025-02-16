import { GameError } from '../../game/game-error';
import { GameMessage } from '../../game/game-message';
import { TrainerCard } from '../../game/store/card/trainer-card';
import { TrainerType, SuperType, Stage } from '../../game/store/card/card-types';
import { StoreLike } from '../../game/store/store-like';
import { State } from '../../game/store/state/state';
import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { PokemonCardList } from '../../game/store/state/pokemon-card-list';
import { TrainerEffect } from '../../game/store/effects/play-card-effects';
import { ChooseCardsPrompt } from '../../game/store/prompts/choose-cards-prompt';
import { CheckHpEffect } from '../../game/store/effects/check-effects';

function* playCard(next: Function, store: StoreLike, state: State, effect: TrainerEffect): IterableIterator<State> {
  const player = effect.player;
  const slots: PokemonCardList[] = player.bench.filter(b => b.cards.length === 0);

  // Player has no empty bench slot
  if (slots.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // Player has no basic Pokemons in the discard pile
  if (!player.discard.cards.some(c => c instanceof PokemonCard && c.stage === Stage.BASIC)) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // We will discard this card after prompt confirmation
  effect.preventDefault = true;

  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
    player.discard,
    { superType: SuperType.POKEMON, stage: Stage.BASIC },
    { min: 1, max: 1, allowCancel: true }
  ), selected => {
    if (selected && selected.length > 0) {
      // Discard trainer only when user selected a Pokémon
      player.hand.moveCardTo(effect.trainerCard, player.discard);
      // Recover discarded Pokémon
      player.discard.moveCardsTo(selected, slots[0]);

      next();
    }
  });

  const checkHpEffect = new CheckHpEffect(player, slots[0]);
  state = store.reduceEffect(state, checkHpEffect);

  const halfHPRoundedDown = Math.floor((checkHpEffect.hp / 2) / 10) * 10;
  slots[0].damage = halfHPRoundedDown;

  return state;
}

export class Revive extends TrainerCard {

  public trainerType: TrainerType = TrainerType.ITEM;

  public set: string = 'BS';

  public name: string = 'Revive';

  public fullName: string = 'Revive BS';

  public text: string =
    'Put 1 Basic Pokémon card from your discard pile onto your Bench. ' +
    'Put damage counters on that Pokémon equal to half its HP (rounded down to the nearest 10). ' +
    '(You can\'t play Revive if your Bench is full.)';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    if (effect instanceof TrainerEffect && effect.trainerCard === this) {
      const generator = playCard(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
