import { Card } from '../../../game/store/card/card';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Power, PowerType, Resistance, Weakness } from '../../../game/store/card/pokemon-types';
import { PowerEffect } from '../../../game/store/effects/game-effects';
import { ShowCardsPrompt } from '../../../game/store/prompts/show-cards-prompt';
import { ShufflePrompt } from '../../../game/store/prompts/shuffle-prompt';
import { Stage, CardType, SuperType, TrainerType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StateUtils } from '../../../game/store/state-utils';
import { StoreLike } from '../../../game/store/store-like';
import { GameError } from '../../../game';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';


function* useRocketCall(next: Function, store: StoreLike, state: State, self: Persian, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  // Try to reduce PowerEffect, to check if something is blocking our ability
  try {
    const powerEffect = new PowerEffect(player, self.powers[0], self);
    state = store.reduceEffect(state, powerEffect);
  } catch {
    return state;
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    { superType: SuperType.TRAINER, trainerType: TrainerType.SUPPORTER, name: 'Giovanni\'s Charisma' },
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

export class Persian extends PokemonCard {

  public id: number = 53;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Meowth';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 110;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Rocket Call',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your turn, you may search your deck for a Giovanni\'s Charisma card, ' +
      'reveal it, and put it into your hand. Then, shuffle your deck.'
  }];

  public attacks = [{
    name: 'Slash',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 70,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Persian';

  public fullName: string = 'Persian MEW';

  public readonly ROCKET_CALL_MARKER = 'ROCKET_CALL_MARKER';



  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Rocket Call
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.ROCKET_CALL_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      player.marker.addMarker(this.ROCKET_CALL_MARKER, this);

      const generator = useRocketCall(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.marker.removeMarker(this.ROCKET_CALL_MARKER, this);
    }

    return state;
  }
}
