import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, SuperType, EnergyType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Power, Resistance } from '../../../game/store/card/pokemon-types';
import { GameMessage } from '../../../game/game-message';
import { AttachEnergyPrompt, EnergyCard, PlayerType, SlotType, StateUtils } from '../../../game';
import { AttachEnergyEffect } from '../../../game/store/effects/play-card-effects';


export class OriginFormeDialgaV extends PokemonCard {

  public id: number = 113;

  public tags: string[] = [CardTag.V];

  public stage: Stage = Stage.BASIC

  public cardTypes: CardType[] = [CardType.METAL];

  public hp: number = 220;

  public weakness = [{ type: CardType.FIRE }];

  public resistance: Resistance[] = [{ type: CardType.GRASS, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public powers: Power[] = [];

  public attacks = [{
    name: 'Metal Coating',
    cost: [CardType.COLORLESS],
    damage: 0,
    text:
      'Attach up to 2 {M} Energy cards from your discard pile to this Pokémon.'
  }, {
    name: 'Temporal Rupture',
    cost: [CardType.METAL, CardType.METAL, CardType.METAL, CardType.COLORLESS],
    damage: 180,
    text: ''
  }];

  public set: string = 'ASR';

  public name: string = 'Origin Forme Dialga V';

  public fullName: string = 'Origin Forme Dialga V ASR';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Metal Coating
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const hasFireEnergyInDiscardPile = player.discard.cards.some(c => {
        return c instanceof EnergyCard
          && c.energyType === EnergyType.BASIC
          && c.provides.includes(CardType.METAL);
      });

      if (!hasFireEnergyInDiscardPile) {
        return state;
      }

      return store.prompt(state, new AttachEnergyPrompt(
        player.id,
        GameMessage.ATTACH_ENERGY_CARDS,
        player.discard,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.ACTIVE],
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, provides: [CardType.METAL] },
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
