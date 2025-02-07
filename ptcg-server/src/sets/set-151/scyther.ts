import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, EnergyType, SuperType } from '../../game/store/card/card-types';
import { StoreLike, State, AttachEnergyPrompt, EnergyCard, GameMessage, PlayerType, SlotType, StateUtils } from '../../game';

export class Scyther extends PokemonCard {

  public id: number = 123;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.GRASS;

  public hp: number = 70;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [];

  public retreat = [];

  public powers = [];

  public attacks = [{
    name: 'Helpful Slash',
    cost: [CardType.GRASS],
    damage: 20,
    text:
      'Attach a Basic {G} Energy card from your discard pile to 1 of your Benched Pokémon.'
  }, {
    name: 'Slicing Blade',
    cost: [CardType.GRASS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 70,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Scyther';

  public fullName: string = 'Scyther MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Helpful Slash
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const hasEnergyInDiscard = player.discard.cards.some(c => {
        return c instanceof EnergyCard
          && c.energyType === EnergyType.BASIC
          && c.provides.includes(CardType.GRASS);
      });

      if (!hasEnergyInDiscard) {
        return state;
      }

      let hasPokemonOnBench = player.bench.some((benchSlot) => {
        benchSlot.cards.length > 0;
      });

      if (!hasPokemonOnBench) {
        return state;
      }

      state = store.prompt(state, new AttachEnergyPrompt(
        player.id,
        GameMessage.ATTACH_ENERGY_TO_BENCH,
        player.discard,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.GRASS] },
        { min: 1, max: 1, allowCancel: true }
      ), transfers => {
        transfers = transfers || [];

        if (transfers.length === 0) {
          return;
        }

        for (const transfer of transfers) {
          const target = StateUtils.getTarget(state, player, transfer.to);
          player.discard.moveCardTo(transfer.card, target);
        }
      });
    }

    return state;
  }
}
