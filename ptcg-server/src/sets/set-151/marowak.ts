import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { ChoosePokemonPrompt, GameError, GameMessage, PlayerType, SlotType, State, StateUtils, StoreLike } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, UseAttackEffect } from '../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';

export class Marowak extends PokemonCard {

  public id: number = 105;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Cubone';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 120;

  public weakness = [{ type: CardType.GRASS }];

  public resistance = [];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Bone Throw',
    cost: [CardType.FIGHTING],
    damage: 30,
    text:
      'This attack also does 30 damage to 1 of your opponent\'s Benched Pokémon. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }, {
    name: 'Boundless Power',
    cost: [CardType.FIGHTING, CardType.COLORLESS],
    damage: 120,
    text:
      'During your next turn, this Pokémon can\'t attack.'
  }];

  public set: string = 'MEW';

  public name: string = 'Marowak';

  public fullName: string = 'Marowak MEW';

  public readonly BOUNDLESS_POWER_MARKER = 'BOUNDLESS_POWER_MARKER';

  private BOUNDLESS_POWER_MARKER_TURN = 0;


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Bone Throw
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const hasBenched = opponent.bench.some(b => b.cards.length > 0);

      if (!hasBenched) {
        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false }
      ), targets => {
        if (!targets || targets.length === 0) {
          return;
        }
        const damageEffect = new PutDamageEffect(effect, 30);
        damageEffect.target = targets[0];
        store.reduceEffect(state, damageEffect);
      });
    }

    // Boundless Power
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      player.active.marker.addMarker(this.BOUNDLESS_POWER_MARKER, this);
      this.BOUNDLESS_POWER_MARKER_TURN = state.turn;
    }

    // Tried to attack while Boundless Power active
    if (effect instanceof UseAttackEffect && effect.player.active.marker.hasMarker(this.BOUNDLESS_POWER_MARKER, this)) {
      throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
    }

    // Clear Boundless Power
    if (effect instanceof EndTurnEffect && state.turn > this.BOUNDLESS_POWER_MARKER_TURN) {
      effect.player.active.marker.removeMarker(this.BOUNDLESS_POWER_MARKER, this);
    }

    return state;
  }
}
