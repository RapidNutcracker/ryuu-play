import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, EnergyType, SuperType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { StateUtils } from '../../../game/store/state-utils';
import { EnergyCard } from '../../../game/store/card/energy-card';
import { AttachEnergyPrompt } from '../../../game/store/prompts/attach-energy-prompt';
import { GameMessage } from '../../../game/game-message';
import { PlayerType, SlotType } from '../../../game/store/actions/play-card-action';
import { AttachEnergyEffect } from '../../../game/store/effects/play-card-effects';

export class Magnemite extends PokemonCard {

  public id: number = 65;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 50;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Magnetic Charge',
    cost: [CardType.LIGHTNING],
    damage: 0,
    text: 'Attach up to 2 Basic {L} Energy cards from your discard pile to 1 of your Benched Pokémon.'
  }, {
    name: 'Speed Ball',
    cost: [CardType.LIGHTNING, CardType.COLORLESS],
    damage: 20,
    text: ''
  }];

  public set: string = 'PAL';

  public name: string = 'Magnemite';

  public fullName: string = 'Magnemite PAL';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Torrid Torrent
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const hasLightningEnergyInDiscardPile = player.discard.cards.some(c => {
        return c instanceof EnergyCard
          && c.energyType === EnergyType.BASIC
          && c.provides.includes(CardType.LIGHTNING);
      });

      const hasBenchedPokemon = player.bench.some(benchSlot => benchSlot.cards.length > 0);

      if (!hasLightningEnergyInDiscardPile || !hasBenchedPokemon) {
        return state;
      }

      return store.prompt(state, new AttachEnergyPrompt(
        player.id,
        GameMessage.ATTACH_ENERGY_CARDS,
        player.discard,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, name: 'Lightning Energy' },
        { min: 1, max: 2, allowCancel: true, sameTarget: true }
      ), transfers => {
        transfers = transfers || [];
        for (const transfer of transfers) {
          const target = StateUtils.getTarget(state, player, transfer.to);
          const energyCard = transfer.card as EnergyCard;

          const attachEnergyEffect = new AttachEnergyEffect(player, energyCard, target, player.discard);
          store.reduceEffect(state, attachEnergyEffect);
        }
      });
    }

    return state;
  }

}
