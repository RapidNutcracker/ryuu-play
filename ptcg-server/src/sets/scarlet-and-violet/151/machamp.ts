import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Effect } from '../../../game/store/effects/effect';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import {
  Attack,
  CoinFlipPrompt,
  GameMessage,
  GamePhase,
  Power,
  PowerType,
  State,
  StateUtils,
  StoreLike,
} from '../../../game';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { CheckHpEffect } from '../../../game/store/effects/check-effects';

export class Machamp extends PokemonCard {

  public id: number = 68;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Machoke';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 180;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Guts',
    powerType: PowerType.ABILITY,
    text:
      'If this Pokémon would be Knocked Out by damage from an attack, flip a coin. ' +
      'If heads, this Pokémon is not Knocked Out, and its remaining HP becomes 10.'
  }];

  public attacks: Attack[] = [{
    name: 'Mountain Chopping',
    cost: [CardType.FIGHTING, CardType.FIGHTING],
    damage: 100,
    text: 'Discard the top card of your opponent\'s deck.'
  }];

  public set: string = 'MEW';

  public name: string = 'Machamp';

  public fullName: string = 'Machamp MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Guts 
    if (effect instanceof PutDamageEffect && effect.target.cards.includes(this)) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      // Do not activate between turns, or when it's not opponents turn.
      if (state.phase !== GamePhase.ATTACK || state.players[state.activePlayer] !== player) {
        return state;
      }

      const checkHpEffect = new CheckHpEffect(opponent, effect.target);
      state = store.reduceEffect(state, checkHpEffect);

      if (effect.damage >= checkHpEffect.hp) {
        return store.prompt(state, new CoinFlipPrompt(
          opponent.id,
          GameMessage.COIN_FLIP
        ), flipResult => {
          if (flipResult) {
            effect.damage = checkHpEffect.hp - 10;
          }
        });
      }

      return state;
    }

    // Mountain Chopping
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;
      opponent.deck.moveTo(opponent.discard, 2);
      return state;
    }

    return state;
  }
}
