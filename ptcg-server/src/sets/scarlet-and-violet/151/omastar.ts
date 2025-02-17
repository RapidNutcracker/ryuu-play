import { AttackEffect, RetreatEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  Attack,
  GameMessage,
  Power,
  PowerType,
  ChoosePokemonPrompt,
  PlayerType,
  SlotType,
  StateUtils,
  GameError
} from '../../../game';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';

export class Omastar extends PokemonCard {

  public id: number = 139;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Omanyte';

  public cardType: CardType = CardType.WATER;

  public hp: number = 150;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Primordial Tentacles',
    powerType: PowerType.ABILITY,
    text: 'As long as this Pokémon is in the Active Spot, your opponent\'s Active Pokémon can\'t retreat.'
  }];

  public attacks: Attack[] = [{
    name: 'Aqua Split',
    cost: [CardType.WATER, CardType.WATER],
    damage: 90,
    text:
      'This attack also does 30 damage to 2 of your opponent\'s Benched Pokémon. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }];

  public set: string = 'MEW';

  public name: string = 'Omastar';

  public fullName: string = 'Omastar MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Primordial Tentacles
    if (effect instanceof RetreatEffect) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (opponent.active.getPokemonCard() === this) {
        throw new GameError(GameMessage.BLOCKED_BY_ABILITY);
      }
    }

    // Aqua Split
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const benched = opponent.bench.reduce((left, b) => left + (b.cards.length ? 1 : 0), 0);
      if (benched === 0) {
        return state;
      }
      const count = Math.min(2, benched);

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        { min: count, max: count, allowCancel: false }
      ), targets => {
        if (!targets || targets.length === 0) {
          return;
        }
        targets.forEach(target => {
          const damageEffect = new PutDamageEffect(effect, 30);
          damageEffect.target = target;
          store.reduceEffect(state, damageEffect);
        });
      });
    }

    return state;
  }

}
