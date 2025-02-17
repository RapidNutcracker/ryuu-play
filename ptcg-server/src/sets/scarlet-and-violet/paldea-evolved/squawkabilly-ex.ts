import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, EnergyType, SuperType, CardTag } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { StateUtils } from '../../../game/store/state-utils';
import { EnergyCard } from '../../../game/store/card/energy-card';
import { AttachEnergyPrompt } from '../../../game/store/prompts/attach-energy-prompt';
import { GameMessage } from '../../../game/game-message';
import { PlayerType, SlotType } from '../../../game/store/actions/play-card-action';
import { AttachEnergyEffect } from '../../../game/store/effects/play-card-effects';
import { Attack, GameError, Power, PowerType, Resistance } from '../../../game';

export class SquawkabillyEx extends PokemonCard {

  public id: number = 169;

  public tags: string[] = [CardTag.EX];

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 160;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Squawk and Seize',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your first turn, you may discard your hand and draw 6 cards. ' +
      'You can\'t use more than 1 Squawk and Seize Ability during your turn.'
  }];

  public attacks: Attack[] = [{
    name: 'Motivate',
    cost: [CardType.COLORLESS],
    damage: 20,
    text: 'Attach up to 2 Basic Energy cards from your discard pile to 1 of your Benched Pokémon.'
  }];

  public set: string = 'PAL';

  public name: string = 'Squawkabilly ex';

  public fullName: string = 'Squawkabilly ex PAL';

  private readonly SQUAWK_AND_SEIZE_MARKER = 'SQUAWK_AND_SEIZE_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Squawk and 
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (state.turn > 2 || player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.SQUAWK_AND_SEIZE_MARKER)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      player.hand.moveTo(player.discard);
      player.deck.moveTo(player.hand, 6);

      player.marker.addMarker(this.SQUAWK_AND_SEIZE_MARKER, this);
    }

    // Motivate
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const hasEnergyInDiscardPile = player.discard.cards.some(c => {
        return c instanceof EnergyCard
          && c.energyType === EnergyType.BASIC;
      });

      if (!hasEnergyInDiscardPile) {
        return state;
      }

      return store.prompt(state, new AttachEnergyPrompt(
        player.id,
        GameMessage.ATTACH_ENERGY_CARDS,
        player.discard,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.BENCH],
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
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
