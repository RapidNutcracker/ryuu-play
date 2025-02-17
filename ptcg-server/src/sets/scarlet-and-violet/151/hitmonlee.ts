import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, ChoosePokemonPrompt, GameMessage, PlayerType, SlotType } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { AfterDamageEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class Hitmonlee extends PokemonCard {

  public id: number = 106;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.FIGHTING];

  public hp: number = 120;

  public weakness: Weakness[] = [{ type: CardType.PSYCHIC }];

  public resistance: Resistance[] = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Twister Kick',
    cost: [CardType.FIGHTING],
    damage: 0,
    text:
      'This attack does 10 damage to each of your opponent\'s Pokémon. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.) ' +
      'Switch this Pokémon with 1 of your Benched Pokémon.'
  }, {
    name: 'Low Kick',
    cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.FIGHTING],
    damage: 100,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Hitmonlee';

  public fullName: string = 'Hitmonlee MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Twister Kick Spread Damage
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const benched = player.bench.filter(b => b.cards.length > 0);

      benched.forEach(target => {
        const damageEffect = new PutDamageEffect(effect, 10);
        damageEffect.target = target;
        store.reduceEffect(state, damageEffect);
      });
    }

    // Twister Kick Switch Pokémon
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const hasBenched = player.bench.some(b => b.cards.length > 0);
      if (!hasBenched) {
        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_NEW_ACTIVE_POKEMON,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false },
      ), selected => {
        if (!selected || selected.length === 0) {
          return state;
        }
        const target = selected[0];
        player.switchPokemon(target);
      });
    }

    return state;
  }

}
