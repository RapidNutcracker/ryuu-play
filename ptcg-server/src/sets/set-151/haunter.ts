import { Effect } from '../../game/store/effects/effect';
import { PlayPokemonEffect } from '../../game/store/effects/play-card-effects';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { PowerEffect } from '../../game/store/effects/game-effects';
import { Stage, CardType, SuperType, TrainerType } from '../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  Power,
  PowerType,
  Attack,
  ChooseCardsPrompt,
  GameMessage,
  StateUtils,
  ConfirmPrompt
} from '../../game';


function* useSpiritReturn(next: Function, store: StoreLike, state: State,
  self: Haunter, effect: PlayPokemonEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  if (opponent.discard.cards.length === 0) {
    return state;
  }

  // Try to reduce PowerEffect, to check if something is blocking our ability
  try {
    const powerEffect = new PowerEffect(player, self.powers[0], self);
    state = store.reduceEffect(state, powerEffect);
  } catch {
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

  return store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_HAND,
    opponent.discard,
    { superType: SuperType.TRAINER, trainerType: TrainerType.SUPPORTER },
    { min: 1, max: 1, allowCancel: true }
  ), selected => {
    const cards = selected || [];
    opponent.discard.moveCardsTo(cards, opponent.hand);
    next();
  });
}


export class Haunter extends PokemonCard {

  public id: number = 93;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Gastly';

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 80;

  public weakness: Weakness[] = [{ type: CardType.DARKNESS }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Spirit Return',
    powerType: PowerType.ABILITY,
    text:
      'When you play this Pokémon from your hand to evolve 1 of your Pokémon during your turn, ' +
      'you may put a Supporter card from your opponent\'s discard pile into their hand.'
  }];

  public attacks: Attack[] = [{
    name: 'Mumble',
    cost: [CardType.PSYCHIC, CardType.COLORLESS],
    damage: 30,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Haunter';

  public fullName: string = 'Haunter MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Spirit Return
    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const generator = useSpiritReturn(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
