import {
  Attack,
  CardTarget,
  ChoosePokemonPrompt,
  CoinFlipPrompt,
  GameError,
  GameMessage,
  PlayerType,
  Power,
  PowerType,
  SlotType,
  State,
  StoreLike,
} from '../../../game';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, HealEffect, PowerEffect } from '../../../game/store/effects/game-effects';


function* useHeal(next: Function, store: StoreLike, state: State, self: Vileplume, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;

  if (self.healUsedTurn === state.turn) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  let hasDamagedPokemon = false;
  const blocked: CardTarget[] = [];
  player.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card, target) => {
    if (cardList.cards.length > 0 && cardList.damage > 0) {
      hasDamagedPokemon = true;
    } else {
      blocked.push(target);
    }
  });

  if (!hasDamagedPokemon) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  // We've officially used the Power
  self.healUsedTurn = state.turn;

  let wonCoinToss: boolean = false;
  yield store.prompt(state, [
    new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
  ], result => {
    wonCoinToss = result;
  });

  if (!wonCoinToss) {
    return state;
  }

  return store.prompt(state, new ChoosePokemonPrompt(
    effect.player.id,
    GameMessage.CHOOSE_POKEMON_TO_HEAL,
    PlayerType.TOP_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { allowCancel: true }
  ), selected => {
    const healEffect = new HealEffect(player, selected[0], 10);
    state = store.reduceEffect(state, healEffect);
  });
}

export class Vileplume extends PokemonCard {

  public id: number = 15;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Gloom';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 80;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Heal',
    powerType: PowerType.POKEMON_POWER,
    useWhenInPlay: true,
    text:
      'Once during your turn (before your attack), you may flip a coin. ' +
      'If heads, remove 1 damage counter from 1 of your Pokémon. ' +
      'This power can\'t be used if Vileplume is Asleep, Confused, or Paralyzed.'
  }];

  public attacks: Attack[] = [{
    name: 'Petal Dance',
    cost: [CardType.GRASS, CardType.GRASS, CardType.GRASS],
    damage: 40,
    text:
      'Flip 3 coins. ' +
      'This attack does 40 damage times the number of heads. ' +
      'Vileplume is now Confused (after doing damage).'
  }];

  public set: string = 'JU';

  public name: string = 'Vileplume';

  public fullName: string = 'Vileplume JU';

  public healUsedTurn: number = 0;


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Heal
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useHeal(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    // Petal Dance
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], results => {
        let heads: number = 0;
        results.forEach(r => { heads += r ? 1 : 0; });
        effect.damage = 40 * heads;
      });
    }

    return state;
  }
}
