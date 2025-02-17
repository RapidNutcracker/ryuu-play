import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { PowerEffect, AttackEffect } from '../../../game/store/effects/game-effects';
import { PowerType } from '../../../game/store/card/pokemon-types';
import { StateUtils } from '../../../game/store/state-utils';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { PokemonCardList } from '../../../game/store/state/pokemon-card-list';
import { CheckPokemonTypeEffect } from '../../../game/store/effects/check-effects';

export class Wobbuffet extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 110;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers = [{
    name: 'Bide Barricade',
    powerType: PowerType.ABILITY,
    text: 'As long as this Pokémon is your Active Pokémon, each Pokémon in ' +
      'play, in each player\'s hand, and in each player\'s discard pile has ' +
      'no Abilities (except for {P} Pokémon).'
  }];

  public attacks = [{
    name: 'Psychic Assault',
    cost: [CardType.PSYCHIC, CardType.COLORLESS],
    damage: 10,
    text: 'This attack does 10 more damage for each damage counter on ' +
      'your opponent\'s Active Pokémon.'
  }];

  public set: string = 'PHF';

  public name: string = 'Wobbuffet';

  public fullName: string = 'Wobbuffet PHF';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      effect.damage += effect.opponent.active.damage;
      return state;
    }

    if (effect instanceof PowerEffect && effect.power.powerType === PowerType.ABILITY) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      // Wobbuffet is not active Pokémon
      if (player.active.getPokemonCard() !== this
        && opponent.active.getPokemonCard() !== this) {
        return state;
      }

      let cardTypes: CardType[] = effect.card instanceof PokemonCard && effect.card.cardTypes || [];

      const cardList = StateUtils.findCardList(state, effect.card);
      if (cardList instanceof PokemonCardList) {
        const checkPokemonType = new CheckPokemonTypeEffect(cardList);
        store.reduceEffect(state, checkPokemonType);
        cardTypes = checkPokemonType.cardTypes;
      }

      // We are not blocking the Abilities from Psychic Pokémon
      if (cardTypes.includes(CardType.PSYCHIC)) {
        return state;
      }

      // Try to reduce PowerEffect, to check if something is blocking our ability
      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      throw new GameError(GameMessage.BLOCKED_BY_ABILITY);
    }

    return state;
  }

}
