import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, Power, ChoosePokemonPrompt, PlayerType, SlotType } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { AfterDamageEffect } from '../../../game/store/effects/attack-effects';

export class Croconaw extends PokemonCard {

  public id: number = 40;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Totodile';

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 90;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks: Attack[] = [{
    name: 'Reverse Thrust',
    cost: [CardType.WATER],
    damage: 30,
    text: 'Switch this Pokémon with 1 of your Benched Pokémon.'
  }];

  public set: string = 'TEF';

  public name: string = 'Croconaw';

  public fullName: string = 'Croconaw TEF';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Reverse Thrust
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
