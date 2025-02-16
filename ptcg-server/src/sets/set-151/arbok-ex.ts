import { AttackEffect, RetreatEffect } from '../../game/store/effects/game-effects';
import {
  Card,
  ChooseCardsPrompt,
  GameError,
  GameMessage,
  Resistance,
  State,
  StoreLike,
  Weakness
} from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';


function* useSpeedDive(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const opponent = effect.opponent;

  let cards: Card[] = [];
  yield store.prompt(state, new ChooseCardsPrompt(
    opponent.id,
    GameMessage.CHOOSE_CARD_TO_DISCARD,
    opponent.hand,
    {},
    { min: 2, max: 2, allowCancel: false }
  ), selected => {
    cards = selected || [];
    next();
  });

  opponent.hand.moveCardsTo(cards, opponent.discard);

  return state;
}

export class ArbokEx extends PokemonCard {

  public id: number = 24;

  public tags: string[] = [CardTag.EX];

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Ekans';

  public cardType: CardType = CardType.DARKNESS;

  public hp: number = 270;

  public weakness: Weakness[] = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Bind Down',
    cost: [CardType.DARKNESS, CardType.DARKNESS],
    damage: 70,
    text: 'During your opponent\'s next turn, the Defending Pokémon can\'t retreat.'
  }, {
    name: 'Speed Dive',
    cost: [CardType.DARKNESS, CardType.DARKNESS, CardType.DARKNESS],
    damage: 150,
    text: 'Your opponent discards 2 cards from their hand.'
  }];

  public set: string = 'MEW';

  public name: string = 'Arbok ex';

  public fullName: string = 'Arbok ex MEW';

  public readonly BIND_DOWN_MARKER = 'BIND_DOWN_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Bind Down
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;

      opponent.active.marker.addMarker(this.BIND_DOWN_MARKER, this);
    }

    // Speed Dive
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useSpeedDive(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Bind Down Active
    if (effect instanceof RetreatEffect && effect.player.active.marker.hasMarker(this.BIND_DOWN_MARKER, this)) {
      effect.preventDefault = true;
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    // Clear Bind Down
    if (effect instanceof EndTurnEffect && effect.player.active.marker.hasMarker(this.BIND_DOWN_MARKER, this)) {
      effect.player.active.marker.removeMarker(this.BIND_DOWN_MARKER, this);
    }

    return state;
  }

}
