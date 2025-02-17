import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Power, PowerType, GameMessage, StateUtils, ConfirmPrompt } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { PowerEffect } from '../../../game/store/effects/game-effects';
import { PlayPokemonEffect } from '../../../game/store/effects/play-card-effects';

export class Hypno extends PokemonCard {

  public id: number = 96;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Drowzee';

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 110;

  public weakness: Weakness[] = [{ type: CardType.DARKNESS }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Here for Hypnosis',
    powerType: PowerType.ABILITY,
    text:
      'When you play this Pokémon from your hand to evolve 1 of your Pokémon ' +
      'during your turn, you may make your opponent\'s Active Pokémon Asleep.'
  }];

  public attacks = [{
    name: 'Super Psy Bolt',
    cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS],
    damage: 110,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Hypno';

  public fullName: string = 'Hypno MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {


    if (effect instanceof PlayPokemonEffect && effect.pokemonCard === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      // Try to reduce PowerEffect, to check if something is blocking our ability
      try {
        const powerEffect = new PowerEffect(player, this.powers[0], this);
        store.reduceEffect(state, powerEffect);
      } catch {
        return state;
      }

      return store.prompt(state, new ConfirmPrompt(
        effect.player.id,
        GameMessage.WANT_TO_USE_ABILITY
      ), result => {
        if (result === true) {
          opponent.active.addSpecialCondition(SpecialCondition.ASLEEP);
        }

        return state;
      });
    }

    return state;
  }

}
