import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, SuperType, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { GamePhase, State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { Power, PowerType } from '../../../game/store/card/pokemon-types';
import { GameMessage } from '../../../game/game-message';
import { PlayPokemonEffect } from '../../../game/store/effects/play-card-effects';
import { AfterDamageEffect } from '../../../game/store/effects/attack-effects';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { Card } from '../../../game/store/card/card';
import { ShowCardsPrompt } from '../../../game/store/prompts/show-cards-prompt';
import { ConfirmPrompt, ShufflePrompt, StateUtils } from '../../../game';


function* useLuminousSign(next: Function, store: StoreLike, state: State, effect: PlayPokemonEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (player.deck.cards.length === 0) {
    return state;
  }

  let wantToUse = false;
  yield store.prompt(state, new ConfirmPrompt(
    effect.player.id,
    GameMessage.WANT_TO_USE_ABILITY
  ), result => {
    wantToUse = result;
    next();
  });

  if (!wantToUse) {
    return state;
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    { superType: SuperType.TRAINER, trainerType: TrainerType.SUPPORTER },
    { min: 1, max: 1, allowCancel: true }
  ), selected => {
    cards = selected || [];
    next();
  });

  if (cards.length > 0) {
    yield store.prompt(state, new ShowCardsPrompt(
      opponent.id,
      GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
      cards
    ), () => next());

    player.deck.moveCardsTo(cards, player.hand);
  }

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}


export class LumineonV extends PokemonCard {

  public id: number = 40;

  public tags: string[] = [CardTag.V];

  public stage: Stage = Stage.BASIC

  public cardType: CardType = CardType.WATER;

  public hp: number = 170;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Luminous Sign',
    powerType: PowerType.ABILITY,
    text:
      'When you play this Pokémon from your hand onto your Bench during your turn, ' +
      'you may search your deck for a Supporter card, reveal it, and put it into your hand. ' +
      'Then, shuffle your deck.'
  }];

  public attacks = [{
    name: 'Aqua Return',
    cost: [CardType.WATER, CardType.COLORLESS, CardType.COLORLESS],
    damage: 120,
    text: 'Shuffle this Pokémon and all attached cards into your deck.'
  }];

  public set: string = 'BRS';

  public name: string = 'Lumineon V';

  public fullName: string = 'Lumineon V BRS';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Luminous Sign
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      if (state.phase !== GamePhase.PLAYER_TURN || state.players[state.activePlayer] !== effect.player) {
        return state;
      }

      const generator = useLuminousSign(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Aqua Return
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      player.active.moveTo(player.deck);

      return store.prompt(state, new ShufflePrompt(player.id), order => {
        player.deck.applyOrder(order);
      });
    }

    return state;
  }

}
