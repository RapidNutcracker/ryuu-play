import { AfterDamageEffect } from '../../../game/store/effects/attack-effects';
import { PowerEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Power, PowerType, Resistance } from '../../../game/store/card/pokemon-types';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StateUtils } from '../../../game/store/state-utils';
import { StoreLike } from '../../../game/store/store-like';
import { ConfirmPrompt } from '../../../game/store/prompts/confirm-prompt';
import { GameError } from '../../../game/game-error';
import { ChooseCardsPrompt } from '../../../game/store/prompts/choose-cards-prompt';
import { Card } from '../../../game/store/card/card';
import { ShufflePrompt } from '../../../game/store/prompts/shuffle-prompt';


function* useQuickSearch(next: Function, store: StoreLike, state: State, self: PidgeotEx, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;

  if (player.deck.cards.length === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  if (player.marker.hasMarker(self.QUICK_SEARCH_MARKER)) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    player.deck,
    {},
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  player.marker.addMarker(self.QUICK_SEARCH_MARKER, self);
  player.deck.moveCardsTo(cards, player.hand);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class PidgeotEx extends PokemonCard {

  public id: number = 164;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Pidgeotto';

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 280;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public powers: Power[] = [{
    name: 'Quick Search',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your turn, you may search your deck for a card and put it into your hand. ' +
      'Then, shuffle your deck. You can\'t use more than 1 Quick Search Ability each turn.'
  }]

  public attacks = [{
    name: 'Blustery Wind',
    cost: [CardType.COLORLESS, CardType.COLORLESS],
    damage: 120,
    text: 'You may discard a Stadium in play.'
  }];

  public set: string = 'OBF';

  public name: string = 'Pidgeot ex';

  public fullName: string = 'Pidgeot ex OBF';

  public readonly QUICK_SEARCH_MARKER = 'QUICK_SEARCH_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Quick Search
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useQuickSearch(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    // Blustery Wind
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {

      const stadiumCard = StateUtils.getStadiumCard(state);
      if (stadiumCard === undefined) {
        return state;
      }

      return store.prompt(state, new ConfirmPrompt(
        effect.player.id,
        GameMessage.WANT_TO_USE_ABILITY
      ), result => {
        if (result === true) {
          const cardList = StateUtils.findCardList(state, stadiumCard);
          const stadiumOwner = StateUtils.findOwner(state, cardList);
          cardList.moveTo(stadiumOwner.discard);
        }
      });
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.QUICK_SEARCH_MARKER)) {
      effect.player.marker.removeMarker(this.QUICK_SEARCH_MARKER);
    }

    return state;
  }
}
