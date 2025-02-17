import { PowerEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  Card,
  ChooseCardsPrompt,
  ShufflePrompt,
  Power,
  PowerType
} from '../../../game';

function* useTransformativeStart(next: Function, store: StoreLike, state: State, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_NEW_ACTIVE_POKEMON,
    player.deck,
    { superType: SuperType.POKEMON, stage: Stage.BASIC },
    { min: 1, max: 1, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  player.active.moveTo(player.discard);
  player.deck.moveCardsTo(cards, player.active);

  return store.prompt(state, new ShufflePrompt(player.id), order => {
    player.deck.applyOrder(order);
  });
}

export class Ditto extends PokemonCard {

  public id: number = 132;

  public stage: Stage = Stage.BASIC

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 60;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Transformative Start',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      ''
  }];

  public attacks = [{
    name: 'Splup',
    cost: [CardType.COLORLESS],
    damage: 10,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Ditto';

  public fullName: string = 'Ditto MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Transformative Start
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useTransformativeStart(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
