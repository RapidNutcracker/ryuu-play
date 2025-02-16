import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Weakness, Resistance, GameMessage, PlayerType, SlotType, StateUtils, ChoosePokemonPrompt, SelectPrompt, CardList, OrderCardsPrompt } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';


function* useProphecy(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  enum OPTION {
    TOP_OF_PLAYER_DECK,
    TOP_OF_OPPONENT_DECK
  }

  const options: { message: string, value: OPTION }[] = [
    { message: 'LABEL_PLAYER_DECK', value: OPTION.TOP_OF_PLAYER_DECK },
    { message: 'LABEL_OPPONENT_DECK', value: OPTION.TOP_OF_OPPONENT_DECK },
  ];

  let selection: OPTION = OPTION.TOP_OF_PLAYER_DECK;
  yield store.prompt(state, new SelectPrompt(
    player.id,
    GameMessage.LOOK_AT_WHICH_DECK,
    options.map(c => c.message),
    { allowCancel: false }
  ), choice => {
    selection = options[choice].value;
    next();
  });

  const deckTop3: CardList = new CardList();
  const chosenDeck = selection === OPTION.TOP_OF_PLAYER_DECK ? player.deck : opponent.deck;

  chosenDeck.moveTo(deckTop3, 3);

  return store.prompt(state, new OrderCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARDS_ORDER,
    deckTop3,
    { allowCancel: true },
  ), order => {
    if (order === null) {
      return state;
    }

    deckTop3.applyOrder(order);
    deckTop3.moveTo(chosenDeck, undefined, true);
  });
}


export class Hypno extends PokemonCard {

  public id: number = 8;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Drowzee';

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 90;

  public weakness: Weakness[] = [{ type: CardType.PSYCHIC }]

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Prophecy',
    cost: [CardType.PSYCHIC],
    damage: 0,
    text:
      'If your opponent has any Benched Pokémon, ' +
      'choose 1 of them and this attack does 10 damage to it. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }, {
    name: 'Dark Mind',
    cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.PSYCHIC],
    damage: 30,
    text:
      'If your opponent has any Benched Pokémon, ' +
      'choose 1 of them and this attack does 10 damage to it. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }];

  public set: string = 'FO';

  public name: string = 'Hypno';

  public fullName: string = 'Hypno FO';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Prophecy
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useProphecy(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Dark Mind
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const hasBenched = opponent.bench.some(b => b.cards.length > 0);

      if (!hasBenched) {
        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false }
      ), targets => {
        if (!targets || targets.length === 0) {
          return;
        }
        const damageEffect = new PutDamageEffect(effect, 10);
        damageEffect.target = targets[0];
        store.reduceEffect(state, damageEffect);
      });
    }

    return state;
  }
}