import {
  Attack,
  GameMessage,
  Power,
  PowerType,
  SelectPrompt,
  State,
  StoreLike,
} from '../../game';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { Effect } from '../../game/store/effects/effect';
import { PowerEffect } from '../../game/store/effects/game-effects';

function* usePeek(next: Function, store: StoreLike, state: State, self: Mankey, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;
  // const opponent = StateUtils.getOpponent(state, player);

  enum OPTION {
    TOP_OF_PLAYER_DECK,
    TOP_OF_OPPONENT_DECK,
    RANDOM_CARD_IN_OPPONENT_HAND,
    ONE_OF_PLAYER_PRIZES,
    ONE_OF_OPPONENT_PRIZES,
  }

  const options: { message: string, value: OPTION }[] = [
    { message: 'LABEL_TOP_OF_PLAYER_DECK', value: OPTION.TOP_OF_PLAYER_DECK },
    { message: 'LABEL_TOP_OF_OPPONENT_DECK', value: OPTION.TOP_OF_OPPONENT_DECK },
    { message: 'LABEL_RANDOM_CARD_IN_OPPONENT_HAND', value: OPTION.RANDOM_CARD_IN_OPPONENT_HAND },
    { message: 'LABEL_ONE_OF_PLAYER_PRIZES', value: OPTION.ONE_OF_PLAYER_PRIZES },
    { message: 'LABEL_ONE_OF_OPPONENT_PRIZES', value: OPTION.ONE_OF_OPPONENT_PRIZES },
  ];

  let selection: OPTION = OPTION.TOP_OF_PLAYER_DECK;
  yield store.prompt(state, new SelectPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_COPY_EFFECT,
    options.map(c => c.message),
    { allowCancel: false }
  ), choice => {
    selection = options[choice].value;
  });

  switch (selection) {
    case OPTION.TOP_OF_PLAYER_DECK:
      break;
    default:

  }
  return state;
}

export class Mankey extends PokemonCard {

  public id: number = 55;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 30;

  public weakness = [{ type: CardType.PSYCHIC }];

  public resistance = [];

  public retreat = [];

  public powers: Power[] = [{
    name: 'Peek',
    powerType: PowerType.POKEMON_POWER,
    useWhenInPlay: true,
    text:
      'Once during your turn (before your attack), ' +
      'you may look at one of the following: ' +
      'the top card of either player\'s deck, ' +
      'a random card from your opponent\'s hand, ' +
      'or one of either player\'s Prizes. ' +
      'This power can\'t be used if Mankey is Asleep, Confused, or Paralyzed.'
  }];

  public attacks: Attack[] = [{
    name: 'Scratch',
    cost: [CardType.COLORLESS],
    damage: 10,
    text: ''
  }];

  public set: string = 'JU';

  public name: string = 'Mankey';

  public fullName: string = 'Mankey JU';

  public healUsedTurn: number = 0;

  public peekUsedTurn: number = 0;

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    /// TODO
    // Peek
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = usePeek(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    return state;
  }
}
