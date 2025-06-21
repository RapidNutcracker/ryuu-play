import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, ChoosePokemonPrompt, PlayerType, SlotType, StateUtils, CoinFlipPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect, AfterDamageEffect } from '../../../game/store/effects/attack-effects';

export class Arbok extends PokemonCard {

  public id: number = 31;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Ekans';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 60;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Terror Strike',
    cost: [CardType.GRASS],
    damage: 30,
    text:
      'Flip a coin. ' +
      'If heads and if your opponent has any Benched Pokémon, ' +
      'he or she chooses 1 of them and switches it with the Defending Pokémon. ' +
      '(Do the damage before switching the Pokémon.)'
  }, {
    name: 'Poison Fang',
    cost: [CardType.GRASS, CardType.GRASS, CardType.COLORLESS],
    damage: 20,
    text:
      'The Defending Pokémon is now Poisoned.'
  }];

  public set: string = 'FO';

  public name: string = 'Arbok';

  public fullName: string = 'Arbok FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Terror Strike
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const opponentHasBench = opponent.bench.some(b => b.cards.length > 0);

      if (!opponentHasBench) {
        return state;
      }

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          return store.prompt(state, new ChoosePokemonPrompt(
            opponent.id,
            GameMessage.CHOOSE_POKEMON_TO_SWITCH,
            PlayerType.BOTTOM_PLAYER,
            [SlotType.BENCH],
            { allowCancel: false }
          ), result => {
            const cardList = result[0];
            opponent.switchPokemon(cardList);
          });
        }
      });
    }

    // Poison Fang
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const specialCondition = new AddSpecialConditionsEffect(effect, [SpecialCondition.POISONED]);
      store.reduceEffect(state, specialCondition);
    }

    return state;
  }
}
