import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  CoinFlipPrompt,
  Power,
  PowerType,
  ChoosePokemonPrompt,
  PlayerType,
  SlotType,
  StateUtils,
  PokemonCardList
} from '../../../game';

export class Starmie extends PokemonCard {

  public id: number = 121;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Staryu';

  public cardType: CardType = CardType.WATER;

  public hp: number = 90;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Mysterious Comet',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your turn, you may put 2 damage counters on 1 of your opponent\'s Pokémon. ' +
      'If you placed any damage counters in this way, discard this Pokémon and all attached cards.'
  }];

  public attacks = [{
    name: 'Speed Attack',
    cost: [CardType.WATER, CardType.COLORLESS],
    damage: 50,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Starmie';

  public fullName: string = 'Starmie MEW';
  

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Mysterious Comet
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;
      const slot = StateUtils.findCardList(state, this) as PokemonCardList;

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.ACTIVE, SlotType.BENCH],
        { allowCancel: true },
      ), selected => {
        const targets = selected || [];

        if (targets.length > 0) {
          targets.forEach(target => {
            target.damage += 20;
          });

          slot.moveTo(player.discard);
        }

        return state;
      });
    }

    // Star Freeze
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }
}
