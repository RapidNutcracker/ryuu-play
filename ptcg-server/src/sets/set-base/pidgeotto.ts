import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Resistance, ChoosePokemonPrompt, PlayerType, SlotType, StateUtils, GamePhase } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';
import { AfterDamageEffect, DealDamageEffect } from '../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class Pidgeotto extends PokemonCard {

  public id: number = 22;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Pidgey';

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 60;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Whirlwind',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: 20,
      text: 'If your opponent has any Benched Pokémon, he or she chooses 1 of them and switches it with the Defending Pokémon. (Do the damage before switching the Pokémon.)'
    },
    {
      name: 'Mirror Move',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 0,
      text: 'If Pidgeotto was attacked last turn, do the final result of that attack on Pidgeotto to the Defending Pokémon.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Pidgeotto';

  public fullName: string = 'Pidgeotto BS';

  private mirrorMoveDamage: number = 0;

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Whirlwind
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const opponentHasBench = opponent.bench.some(b => b.cards.length > 0);

      if (!opponentHasBench) {
        return state;
      }

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

    // Mirror Move
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const dealDamage = new DealDamageEffect(effect, this.mirrorMoveDamage);
      dealDamage.target = opponent.active;
      return store.reduceEffect(state, dealDamage);
    }

    // Set Mirror Move Damage to Last Received Attack
    /// TODO: Is this good?
    if (effect instanceof AfterDamageEffect && effect.target.getPokemonCard() === this) {
      const player = effect.player;
      const targetPlayer = StateUtils.findOwner(state, effect.target);

      if (effect.damage <= 0 || player === targetPlayer) {
        return state;
      }

      if (state.phase === GamePhase.ATTACK) {
        this.mirrorMoveDamage = effect.damage;
      }
    }

    // Clear Mirror Move Damage
    if (effect instanceof EndTurnEffect && this.mirrorMoveDamage > 0) {
      this.mirrorMoveDamage = 0;
    }

    return state;
  }
}
