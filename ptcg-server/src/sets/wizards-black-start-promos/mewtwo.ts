import { StoreLike, State, StateUtils, PlayerType, AttachEnergyPrompt, EnergyCard, SlotType } from '../../game';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType } from '../../game/store/card/card-types';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';
import { AttachEnergyEffect } from '../../game/store/effects/play-card-effects';

export class Mewtwo extends PokemonCard {

  public id: number = 3;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 70;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Energy Absorption',
    cost: [CardType.PSYCHIC],
    damage: 0,
    text: 'Choose up to 2 Energy cards from your discard pile and attach them to Mewtwo.'
  }, {
    name: 'Psyburn',
    cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.COLORLESS],
    damage: 40,
    text: ''
  }];

  public set: string = 'WBSP';

  public name: string = 'Mewtwo';

  public fullName: string = 'Mewtwo WBSP';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Energy Absorption
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const hasEnergyCardsInDiscardPile = player.discard.cards.some(c => {
        return c instanceof EnergyCard;
      });

      if (!hasEnergyCardsInDiscardPile) {
        return state;
      }

      return store.prompt(state, new AttachEnergyPrompt(
        player.id,
        GameMessage.ATTACH_ENERGY_CARDS,
        player.discard,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.ACTIVE],
        { superType: SuperType.ENERGY },
        { min: 1, max: 2, allowCancel: true }
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
